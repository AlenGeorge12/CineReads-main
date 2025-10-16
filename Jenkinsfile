// Jenkinsfile for the CineReads Backend

pipeline {
    // 1. Agent Definition: Specifies where the pipeline will run. 'any' means any available agent.
    agent any

    // 2. Environment Variables: Define variables that will be used throughout the pipeline.
    environment {
        // Values from your tf_outputs.json file
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
                git branch: 'main', url: 'https://github.com/AlenGeorge12/CineReads-main.git'
                // If your repo is private, you would add: credentialsId: 'github-pat'
            }
        }

        // STAGE 2: Build Docker Image - Builds the image using the Dockerfile in your repo.
        stage('Build Docker Image') {
            steps {
                echo "Building Docker image: ${ECR_REPOSITORY}:${IMAGE_TAG}"
                // The Docker Pipeline plugin provides this 'docker.build()' command.
                script {
                    docker.build("${ECR_REPOSITORY}:${IMAGE_TAG}", "backend")
                }
            }
        }

        // STAGE 3: Push Image to ECR - Authenticates with AWS and pushes the image.
        // STAGE 3: Push Image to ECR (NEW AND IMPROVED VERSION)
        stage('Push Image to ECR') {
            steps {
                echo "Logging into ECR and pushing image..."
                // Use the withCredentials step to securely load the AWS keys into environment variables
                withCredentials([aws(credentialsId: 'aws-ecr-credentials', accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    
                    // 1. Login to ECR using the AWS CLI. This is the most reliable method.
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"

                    // 2. Tag the image with the full ECR path before pushing.
                    sh "docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"
                    sh "docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"

                    // 3. Push both the version tag and the 'latest' tag to ECR.
                    sh "docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"
                    sh "docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"
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