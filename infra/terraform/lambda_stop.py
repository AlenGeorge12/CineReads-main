import boto3

def lambda_handler(event, context):
    ec2 = boto3.client('ec2')
    # Stop instances tagged Name=cinereads-jenkins
    filters = [{'Name': 'tag:Name', 'Values': ['cinereads-jenkins']}]
    resp = ec2.describe_instances(Filters=filters)
    instances = []
    for r in resp.get('Reservations', []):
        for i in r.get('Instances', []):
            if i.get('State', {}).get('Name') == 'running':
                instances.append(i['InstanceId'])
    if instances:
        ec2.stop_instances(InstanceIds=instances)
    return {"stopped": instances}
