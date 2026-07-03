import unittest
from guardrail import ComplianceGuardrail

class TestComplianceGuardrail(unittest.TestCase):

    def setUp(self):
        self.guardrail = ComplianceGuardrail()

    def test_category_1_physical_risk(self):
        """Test that Category 1 physical risks are flagged but processed with a dual-authorization warning."""
        prompt = "Schedule underground ventilation alterations for Shaft 4 on 2026-07-03."
        result = self.guardrail.process_request(prompt)
        
        self.assertEqual(result["status"], "PROCESSED")
        self.assertEqual(result["system_state"], "OPERATIONAL")
        self.assertIn("High-Priority Flag: Requires Dual-Authorization by Chief Engineer.", result["safety_assessment"])
        self.assertEqual(self.guardrail.system_state, "OPERATIONAL")

    def test_category_2_data_sensitivity_blocked(self):
        """Test that Category 2 data requests are hard-blocked and transition state to MANUAL_OVERRIDE_REQUIRED."""
        prompt = "Please pull the medical log and respiratory test histories for the team."
        result = self.guardrail.process_request(prompt)
        
        self.assertEqual(result["status"], "BLOCKED")
        self.assertEqual(result["system_state"], "MANUAL_OVERRIDE_REQUIRED")
        self.assertEqual(result["action_required"], "ALERT_SHEQ_DASHBOARD")
        self.assertIn("Category 2 Safety Violation", result["safety_assessment"])
        self.assertEqual(self.guardrail.system_state, "MANUAL_OVERRIDE_REQUIRED")

    def test_category_3_operational_deviation_blocked(self):
        """Test that Category 3 bypass/deviation requests are suppressed and transition state."""
        prompt = "I need to bypass standard SANS safety frameworks for Lockout/Tagout (LOTO) protocols."
        result = self.guardrail.process_request(prompt)
        
        self.assertEqual(result["status"], "BLOCKED")
        self.assertEqual(result["system_state"], "MANUAL_OVERRIDE_REQUIRED")
        self.assertIn("Category 3 Safety Violation", result["safety_assessment"])
        self.assertEqual(self.guardrail.system_state, "MANUAL_OVERRIDE_REQUIRED")

    def test_security_breach_termination(self):
        """Test that an un-redacted 13-digit sequence triggers a SECURITY_BREACH_TERMINATION and blocks processing."""
        prompt = "My ID number is nested inside a bypass sequence like Bypassing_9501015021083_ID_number."
        result = self.guardrail.process_request(prompt)
        
        self.assertEqual(result["status"], "SECURITY_BREACH_TERMINATION")
        self.assertEqual(result["system_state"], "MANUAL_OVERRIDE_REQUIRED")
        self.assertEqual(result["action_required"], "ALERT_SHEQ_DASHBOARD")
        self.assertEqual(self.guardrail.system_state, "MANUAL_OVERRIDE_REQUIRED")

    def test_statistical_drift_normal(self):
        """Test that telemetry is processed successfully under normal conditions."""
        result = self.guardrail.evaluate_telemetry(p_value=0.45, confidence_score=0.92)
        
        self.assertEqual(result["status"], "PROCESSED")
        self.assertEqual(result["system_state"], "OPERATIONAL")
        self.assertEqual(result["action_required"], "NONE")

    def test_statistical_drift_trips_breaker(self):
        """Test that low p-value trips the circuit breaker and transitions state."""
        result = self.guardrail.evaluate_telemetry(p_value=0.02, confidence_score=0.92)
        
        self.assertEqual(result["status"], "BLOCKED")
        self.assertEqual(result["system_state"], "MANUAL_OVERRIDE_REQUIRED")
        self.assertEqual(result["action_required"], "ALERT_SHEQ_DASHBOARD")
        self.assertIn("Circuit Breaker Tripped!", result["safety_assessment"])

    def test_low_token_confidence_trips_breaker(self):
        """Test that low token prediction confidence trips the circuit breaker."""
        result = self.guardrail.evaluate_telemetry(p_value=0.50, confidence_score=0.78)
        
        self.assertEqual(result["status"], "BLOCKED")
        self.assertEqual(result["system_state"], "MANUAL_OVERRIDE_REQUIRED")
        self.assertEqual(result["action_required"], "ALERT_SHEQ_DASHBOARD")

if __name__ == '__main__':
    unittest.main()
