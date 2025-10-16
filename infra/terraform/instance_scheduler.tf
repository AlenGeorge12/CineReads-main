# Lambda + CloudWatch rule to stop Jenkins instance nightly (low-cost safety)
resource "aws_iam_role" "lambda_scheduler" {
  name = "cinereads-lambda-scheduler-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_scheduler_policy" {
  name = "cinereads-lambda-scheduler-policy"
  role = aws_iam_role.lambda_scheduler.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      { Effect = "Allow", Action = ["ec2:StopInstances","ec2:DescribeInstances"], Resource = "*" },
      { Effect = "Allow", Action = ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"], Resource = "arn:aws:logs:*:*:*" }
    ]
  })
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda_stop.py"
  output_path = "${path.module}/lambda_stop.zip"
}

resource "aws_lambda_function" "stop_jenkins_instance" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "cinereads-stop-jenkins"
  role             = aws_iam_role.lambda_scheduler.arn
  handler          = "lambda_stop.lambda_handler"
  runtime          = "python3.10"
  source_code_hash = filebase64sha256(data.archive_file.lambda_zip.output_path)
}

resource "aws_cloudwatch_event_rule" "daily_stop_rule" {
  name                = "cinereads-daily-stop"
  schedule_expression = "cron(0 23 * * ? *)" # daily 23:00 UTC
}

resource "aws_cloudwatch_event_target" "stop_target" {
  rule      = aws_cloudwatch_event_rule.daily_stop_rule.name
  target_id = "stop-jenkins-target"
  arn       = aws_lambda_function.stop_jenkins_instance.arn
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stop_jenkins_instance.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_stop_rule.arn
}
