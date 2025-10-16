// Jenkinsfile for the CineReads Backend

pipeline {
    agent any

    environment {
        AWS_REGION      = "ap-south-1"
        ECR_REGISTRY    = "622310271659.dkr.ecr.ap-south-1.amazonaws.com"
        ECR_REPOSITORY  = "cinereads-backend"
        IMAGE_TAG       = "v${env.BUILD_NUMBER}"
        APP_CONTAINER_NAME = "cinereads-backend-app" // A name for our running container
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from Git...'
                git branch: 'main', url: 'https://github.com/AlenGeorge12/CineReads-main.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image: ${ECR_REPOSITORY}:${IMAGE_TAG}"
                script {
                    docker.build("${ECR_REPOSITORY}:${IMAGE_TAG}", "backend")
                }
            }
        }

        stage('Push Image to ECR') {
            steps {
                echo "Logging into ECR and pushing image..."
                withCredentials([aws(credentialsId: 'aws-ecr-credentials', accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
                    sh "docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"
                    sh "docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"
                    sh "docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"
                    sh "docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"
                }
            }
        }

        // --- NEW STAGE ADDED HERE ---
        stage('Deploy to EC2') {
            steps {
                echo "Deploying the latest backend container..."
                script {
                    // Stop and remove the old container if it exists, to avoid port conflicts.
                    // '|| true' ensures the command doesn't fail if the container isn't running.
                    sh "docker stop ${APP_CONTAINER_NAME} || true"
                    sh "docker rm ${APP_CONTAINER_NAME} || true"

                    // Run the new container from the 'latest' image we pushed to ECR.
                    // -d runs it in detached mode (in the background).
                    // -p 8000:8000 maps the EC2's port 8000 to the container's port 8000.
                    sh "docker run -d --name ${APP_CONTAINER_NAME} -p 8000:8000 ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up old Docker images...'
            sh 'docker image prune -f'
        }
    }
}