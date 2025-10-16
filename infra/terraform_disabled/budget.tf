resource "aws_budgets_budget" "monthly_cost_alert" {
  name = "cinereads-monthly-cost"

  budget_type = "COST"
  limit_amount = "1"
  limit_unit = "USD"

  time_unit = "MONTHLY"
  # start today (ISO date)
  time_period_start = formatdate("YYYY-MM-DD", timestamp())

  cost_types {
    include_tax = true
  }

  # notification + subscribers container block (supported shape)
  notifications_with_subscribers {
    notification {
      comparison_operator = "GREATER_THAN"
      threshold = 1.0
      threshold_type = "PERCENTAGE"
      notification_type = "FORECASTED"
    }

    subscribers {
      subscription_type = "EMAIL"
      address           = "your-email@example.com"  # << replace with your email
    }
  }
}
