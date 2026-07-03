import re
import json
from sanitizer import sanitize_user_input, gatekeeper_wrapper, SecurityException

class ComplianceGuardrail:
    """
    ComplianceGuardrail provides the core compliance-first safety logic for Melotwo.
    It wraps user input sanitization, high-risk operational classification,
    and statistical telemetry drift validation.
    """
    def __init__(self):
        # Keep track of backend system state
        self.system_state = "OPERATIONAL"

    def process_request(self, raw_prompt: str) -> dict:
        """
        Processes a prompt/log through the three-layer architectural safety perimeter.
        Returns a dictionary structure conforming to the Melotwo output specification.
        """
        # --- LAYER 1: DATA SANITIZATION ---
        try:
            # gatekeeper_wrapper raises SecurityException if a 13-digit ID remains
            sanitized_log = gatekeeper_wrapper(raw_prompt)
        except SecurityException as e:
            # Severe breach detected, immediately halt processing and return termination status
            self.system_state = "MANUAL_OVERRIDE_REQUIRED"
            return {
                "sanitized_log": "[BREACH DETECTED - DATA REDACTED]",
                "status": "SECURITY_BREACH_TERMINATION",
                "action_required": "ALERT_SHEQ_DASHBOARD",
                "system_state": "MANUAL_OVERRIDE_REQUIRED",
                "safety_assessment": f"Security Breach Terminated: {str(e)}"
            }

        # Analyze the sanitized string for risk-zone triggers
        lower_text = sanitized_log.lower()

        # --- LAYER 2: HIGH-RISK THRESHOLDS & MANDATORY SUPPRESSION ---
        
        # Category 2 (Data Sensitivity): employee training, health/medical logs, worker PII
        if any(kw in lower_text for kw in ["training history", "medical log", "health history", "chronic condition", "respiratory test"]):
            # Hard-block the request
            self.system_state = "MANUAL_OVERRIDE_REQUIRED"
            return {
                "sanitized_log": "[SENSITIVE DATA SHIELDED]",
                "status": "BLOCKED",
                "action_required": "ALERT_SHEQ_DASHBOARD",
                "system_state": "MANUAL_OVERRIDE_REQUIRED",
                "safety_assessment": "Category 2 Safety Violation: Access to confidential training, health, or PII logs blocked. Route exceptions directly to the Data Protection Officer."
            }

        # Category 3 (Operational Deviation): bypass SANS, change shift-change patterns, modify lockout/tagout (LOTO) structures
        if any(kw in lower_text for kw in ["bypass", "hotwire", "force-open", "lockout", "tagout", "loto", "deviate"]):
            # Immediately suppress the recommendation / hard-block the prompt
            self.system_state = "MANUAL_OVERRIDE_REQUIRED"
            return {
                "sanitized_log": "[UNAUTHORIZED OPERATION SUPPRESSED]",
                "status": "BLOCKED",
                "action_required": "ALERT_SHEQ_DASHBOARD",
                "system_state": "MANUAL_OVERRIDE_REQUIRED",
                "safety_assessment": "Category 3 Safety Violation: Request to bypass or modify SANS-compliant Lockout/Tagout (LOTO) safety structures blocked. Log routed to the SHEQ team."
            }

        # Category 1 (Immediate Physical Risk): blast schedules, underground ventilation alterations, heavy machinery, working at heights
        if any(kw in lower_text for kw in ["blast", "ventilation", "heavy machinery", "heights"]):
            # Set high-priority flag
            return {
                "sanitized_log": sanitized_log,
                "status": "PROCESSED",
                "action_required": "NONE",
                "system_state": "OPERATIONAL",
                "safety_assessment": "High-Priority Flag: Requires Dual-Authorization by Chief Engineer. Proceeding with caution; physical operations must not be automated without chief sign-off."
            }

        # Default standard safe prompt processing
        return {
            "sanitized_log": sanitized_log,
            "status": "PROCESSED",
            "action_required": "NONE",
            "system_state": "OPERATIONAL",
            "safety_assessment": "Compliance analysis complete. No risk thresholds or sanitization exceptions were triggered."
        }

    def evaluate_telemetry(self, p_value: float, confidence_score: float, drift_profile: list = None) -> dict:
        """
        --- LAYER 3: STATISTICAL MONITORING & SYSTEM STATE MANAGEMENT ---
        Monitors Kolmogorov-Smirnov distribution test p-values and internal token prediction confidence.
        If any threshold is violated, trips the system circuit breaker and updates system states.
        """
        if drift_profile is None:
            drift_profile = ["Telemetry distribution deviation detected"]

        if p_value < 0.05 or confidence_score < 0.85:
            # Trip the circuit breaker
            self.system_state = "MANUAL_OVERRIDE_REQUIRED"
            return {
                "status": "BLOCKED",
                "action_required": "ALERT_SHEQ_DASHBOARD",
                "system_state": "MANUAL_OVERRIDE_REQUIRED",
                "safety_assessment": f"Circuit Breaker Tripped! Data drift or confidence score below safe bounds. (p-value: {p_value:.4f}, confidence: {confidence_score:.2%})",
                "drift_profile": drift_profile
            }
        
        return {
            "status": "PROCESSED",
            "action_required": "NONE",
            "system_state": "OPERATIONAL",
            "safety_assessment": f"Statistical validation within standard margins. (p-value: {p_value:.4f}, confidence: {confidence_score:.2%})"
        }
