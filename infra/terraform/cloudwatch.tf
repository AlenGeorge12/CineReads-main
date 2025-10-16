resource "aws_sns_topic" "alerts" {
  name = "cinereads-alerts"
}

resource "aws_cloudwatch_metric_alarm" "high_5xx" {
  alarm_name          = "cinereads-5xx-spike"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
