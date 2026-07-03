import unittest
from sanitizer import sanitize_user_input, gatekeeper_wrapper, SecurityException

class TestPIISanitizer(unittest.TestCase):

    # -------------------------------------------------------------
    # 1. TRUE POSITIVES (Successful redacting of PII)
    # -------------------------------------------------------------
    def test_redact_south_african_id(self):
        """Test that any 13-digit South African ID sequence is replaced with [ID_MASKED]."""
        raw_text = "The audit was authorized by ID 9202205021083 at the site entrance."
        expected = "The audit was authorized by ID [ID_MASKED] at the site entrance."
        self.assertEqual(sanitize_user_input(raw_text), expected)

    def test_redact_phone_numbers(self):
        """Test that South African format phone numbers are replaced with [PHONE_MASKED]."""
        # Test international format
        self.assertEqual(
            sanitize_user_input("Call us at +27821234567 immediately."),
            "Call us at [PHONE_MASKED] immediately."
        )
        # Test local 10-digit formats with prefixes
        self.assertEqual(
            sanitize_user_input("Reported on cell number: 082 123 4567"),
            "Reported on cell number: [PHONE_MASKED]"
        )
        self.assertEqual(
            sanitize_user_input("Dial 071-123-4567 for emergency safety issues."),
            "Dial [PHONE_MASKED] for emergency safety issues."
        )

    def test_redact_names_with_prefixes(self):
        """Test that names with specific organizational prefixes are properly masked."""
        self.assertEqual(
            sanitize_user_input("The incident was logged by Operator: John Doe."),
            "The incident was logged by Operator: [WORKER_NAME]."
        )
        self.assertEqual(
            sanitize_user_input("The daily ventilation log is Reported by Jane Smith."),
            "The daily ventilation log is Reported by [WORKER_NAME]."
        )
        self.assertEqual(
            sanitize_user_input("The site walkthrough was Attended by Dave."),
            "The site walkthrough was Attended by [WORKER_NAME]."
        )
        self.assertEqual(
            sanitize_user_input("Audit conducted by Auditor Sarah Jenkins."),
            "Audit conducted by Auditor [WORKER_NAME]."
        )
        self.assertEqual(
            sanitize_user_input("Assigned task to Worker: Jack Black."),
            "Assigned task to Worker: [WORKER_NAME]."
        )


    # -------------------------------------------------------------
    # 2. FALSE POSITIVES / EDGE CASES (No false alarms)
    # -------------------------------------------------------------
    def test_false_positives_equipment_serials(self):
        """Ensure standard 8-digit equipment serial numbers are NOT incorrectly redacted."""
        serial_text = "LHD Loader serial number is SN-58392019."
        self.assertEqual(sanitize_user_input(serial_text), serial_text)

    def test_false_positives_dates(self):
        """Ensure ISO standard dates (YYYY-MM-DD) are NOT incorrectly redacted."""
        date_text = "The shift log was submitted on 2026-07-03."
        self.assertEqual(sanitize_user_input(date_text), date_text)

    def test_false_positives_generic_sentences(self):
        """Ensure standard statements containing general numbers or unrelated words are untouched."""
        generic_text = "The team processed 150 compliance audits with 4 critical findings in zone 5."
        self.assertEqual(sanitize_user_input(generic_text), generic_text)


    # -------------------------------------------------------------
    # 3. EDGE CASE HANDLING & SPECIAL STRINGS
    # -------------------------------------------------------------
    def test_empty_and_null_inputs(self):
        """Ensure the sanitizer gracefully handles empty or non-string inputs."""
        self.assertEqual(sanitize_user_input(""), "")
        self.assertEqual(sanitize_user_input(None), "")

    def test_special_characters_only(self):
        """Ensure strings containing only punctuation or special characters are returned as-is."""
        special_text = "!@#$%^&*()_+=-[]{};':\",./<>?\\|"
        self.assertEqual(sanitize_user_input(special_text), special_text)

    def test_already_sanitized(self):
        """Ensure text that is already sanitized or clean is not altered."""
        clean_text = "This text is clean. Logged by Operator: [WORKER_NAME]. ID is [ID_MASKED]."
        self.assertEqual(sanitize_user_input(clean_text), clean_text)


    # -------------------------------------------------------------
    # 4. GATEKEEPER & SECURITY EXCEPTION TESTS
    # -------------------------------------------------------------
    def test_gatekeeper_normal_execution(self):
        """Verify that safe inputs return successfully via the gatekeeper wrapper."""
        raw_text = "Operator: John Doe reported a LHD Loader serial SN-58392019 status on 2026-07-03."
        expected = "Operator: [WORKER_NAME] reported a LHD Loader serial SN-58392019 status on 2026-07-03."
        self.assertEqual(gatekeeper_wrapper(raw_text), expected)

    def test_gatekeeper_raises_security_exception(self):
        """Verify that the gatekeeper raises a SecurityException if a 13-digit sequence leaks through."""
        # This simulated text has a 13-digit number embedded inside another word where the standard
        # space-boundary regex might fail to fully clear it, or is a nested raw bypass string.
        bypass_text = "Bypassing_9501015021083_ID_number"
        
        # When passed to gatekeeper_wrapper, it should detect any remaining 13-digit sequence and raise SecurityException
        with self.assertRaises(SecurityException):
            gatekeeper_wrapper(bypass_text)


if __name__ == '__main__':
    unittest.main()
