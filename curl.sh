curl -X POST \
     -d '{"xqueue_files": "{}", "xqueue_body": "{\"student_info\": \"{\\\"anonymous_student_id\\\": \\\"1679091c5a880faf6fb5e6087eb1b2dc\\\", \\\"submission_time\\\": \\\"20160510111614\\\"}\", \"grader_payload\": \"\\n                      {\\\"payload\\\":\\\"eyJiYXNlIjoiJSBJbnNlcmlzY2kgcXVpIGlsIHR1byBjb2RpY2UiLCJzb2x1dGlvbiI6InN0ciA9ICdhYmMnOyIsInZhbGlkYXRpb24iOiJhc3NlcnQoc3RyID09ICdhYmMnKTsiLCJjb250ZXh0IjoiIiwibGFuZyI6Im1hdGxhYiJ9\\\"}\\n                    \", \"student_response\": \"% Inserisci qui il tuo codice\\r\\nstr = 1\"}"}' \
     http://localhost:3000/payload
