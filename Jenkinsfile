// Jenkinsfile for the CineReads Backend

pipeline {
    // 1. Agent Definition: Specifies where the pipeline will run. 'any' means any available agent.
    agent any

    // 2. Environment Variables: Define variables that will be used throughout the pipeline.
    environment {
        // Fetch these values from your tf_outputs.json file
        AWS_REGION      = "ap-south-1"
        ECR_REGISTRY    = "622310271659.dkr.ecr.ap-south-1.amazonaws.com"
        ECR_REPOSITORY  = "cinereads-backend"
        // Create a unique image tag using the Jenkins build number
        IMAGE_TAG       = "v${env.BUILD_NUMBER}"
    }

    // 3. Stages: The main blocks of work in your pipeline.
    stages {

        // STAGE 1: Checkout - Pulls the latest code from your repository.
        stage('Checkout') {
            steps {
                echo 'Checking out code from Git...'
                // This command is built-in and uses the Git plugin.
                git branch: 'main', url: 'https://github.com/your-username/CineReads-main.git'
                // If your repo is private, you would add: credentialsId: 'github-pat'
            }
        }

        // STAGE 2: Build Docker Image - Builds the image using the Dockerfile in your repo.
        stage('Build Docker Image') {
            steps {
                echo "Building Docker image: ${ECR_REPOSITORY}:${IMAGE_TAG}"
                // The Docker Pipeline plugin provides this 'docker.build()' command.
                script {
                    docker.build("${ECR_REPOSITORY}:${IMAGE_TAG}", ".")
                }
            }
        }

        // STAGE 3: Push Image to ECR - Authenticates with AWS and pushes the image.
        stage('Push Image to ECR') {
            steps {
                echo "Pushing image to ECR..."
                // This is the most important step.
                // It uses the AWS Credentials (aws-ecr-credentials) we configured in Jenkins.
                script {
                    docker.withRegistry("https://${ECR_REGISTRY}", 'aws-ecr-credentials') {
                        docker.image("${ECR_REPOSITORY}:${IMAGE_TAG}").push()

                        // Also push a 'latest' tag for convenience
                        docker.image("${ECR_REPOSITORY}:${IMAGE_TAG}").push('latest')
                    }
                }
            }
        }
    }

    // 4. Post-build Actions: These actions run after all stages are complete.
    post {
        // 'always' will run regardless of whether the pipeline succeeded or failed.
        always {
            echo 'Cleaning up old Docker images...'
            // This shell command removes dangling images to save disk space on the Jenkins server.
            sh 'docker image prune -f'
        }
    }
}