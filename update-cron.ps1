$promptFile = "C:\Users\cheng\.openclaw\workspace\articles\cron-morning-prompt.txt"
$msg = [System.IO.File]::ReadAllText($promptFile)
$tempFile = "C:\Users\cheng\.openclaw\workspace\articles\cron-msg-temp.txt"
# Write message with proper encoding, no BOM
[System.IO.File]::WriteAllText($tempFile, $msg, [System.Text.UTF8Encoding]::new($false))
Write-Output "Message saved to temp file ($($msg.Length) chars)"
