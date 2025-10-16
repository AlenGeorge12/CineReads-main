// Jenkinsfile for the CineReads Full-Stack Application
// Updated to include frontend deployment - Build #10

pipeline {
    agent any

    environment {
        AWS_REGION      = "ap-south-1"
        ECR_REGISTRY    = "622310271659.dkr.ecr.ap-south-1.amazonaws.com"
        BACKEND_ECR_REPOSITORY  = "cinereads-backend"
        FRONTEND_ECR_REPOSITORY = "cinereads-frontend"
        IMAGE_TAG       = "v${env.BUILD_NUMBER}"
        BACKEND_CONTAINER_NAME = "cinereads-backend-app"
        FRONTEND_CONTAINER_NAME = "cinereads-frontend-app"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from Git...'
                git branch: 'main', url: 'https://github.com/AlenGeorge12/CineReads-main.git'
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                echo "Building backend Docker image: ${BACKEND_ECR_REPOSITORY}:${IMAGE_TAG}"
                script {
                    docker.build("${BACKEND_ECR_REPOSITORY}:${IMAGE_TAG}", "backend")
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                echo "Building frontend Docker image: ${FRONTEND_ECR_REPOSITORY}:${IMAGE_TAG}"
                script {
                    docker.build("${FRONTEND_ECR_REPOSITORY}:${IMAGE_TAG}", "frontend")
                }
            }
        }

        stage('Push Images to ECR') {
            steps {
                echo "Logging into ECR and pushing images..."
                withCredentials([aws(credentialsId: 'aws-ecr-credentials', accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"

                    // Push backend images
                    sh "docker tag ${BACKEND_ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REGISTRY}/${BACKEND_ECR_REPOSITORY}:${IMAGE_TAG}"
                    sh "docker tag ${BACKEND_ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REGISTRY}/${BACKEND_ECR_REPOSITORY}:latest"
                    sh "docker push ${ECR_REGISTRY}/${BACKEND_ECR_REPOSITORY}:${IMAGE_TAG}"
                    sh "docker push ${ECR_REGISTRY}/${BACKEND_ECR_REPOSITORY}:latest"

                    // Push frontend images
                    sh "docker tag ${FRONTEND_ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REGISTRY}/${FRONTEND_ECR_REPOSITORY}:${IMAGE_TAG}"
                    sh "docker tag ${FRONTEND_ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REGISTRY}/${FRONTEND_ECR_REPOSITORY}:latest"
                    sh "docker push ${ECR_REGISTRY}/${FRONTEND_ECR_REPOSITORY}:${IMAGE_TAG}"
                    sh "docker push ${ECR_REGISTRY}/${FRONTEND_ECR_REPOSITORY}:latest"
                }
            }
        }

        stage('Deploy Backend to EC2') {
            steps {
                echo "Deploying the latest backend container..."
                script {
                    sh "docker stop ${BACKEND_CONTAINER_NAME} || true"
                    sh "docker rm ${BACKEND_CONTAINER_NAME} || true"
                    sh "docker run -d --name ${BACKEND_CONTAINER_NAME} -p 8000:8000 -e OPENAI_API_KEY=placeholder -e HARDCOVER_API_KEY=placeholder ${ECR_REGISTRY}/${BACKEND_ECR_REPOSITORY}:latest"
                }
            }
        }

        stage('Deploy Frontend to EC2') {
            steps {
                echo "Deploying the latest frontend container..."
                script {
                    sh "docker stop ${FRONTEND_CONTAINER_NAME} || true"
                    sh "docker rm ${FRONTEND_CONTAINER_NAME} || true"
                    sh "docker run -d --name ${FRONTEND_CONTAINER_NAME} -p 3000:3000 ${ECR_REGISTRY}/${FRONTEND_ECR_REPOSITORY}:latest"
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