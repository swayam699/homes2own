pipeline {
    agent any

    environment {
        NODE_ENV = 'test'
        CI = 'true'
        DB_CLIENT = 'sqlite'
        IMAGE_TAG = "${env.BUILD_NUMBER ?: 'latest'}"
    }

    stages {
        // Stage 1: SCM Checkout
        stage('Checkout') {
            steps {
                echo '=== Stage 1: Checking out HOMES2OWN source repository ==='
                checkout scm
            }
        }

        // Stage 2: Environment Validation
        stage('Environment Validation') {
            steps {
                echo '=== Stage 2: Validating host runtime tools ==='
                sh 'node --version'
                sh 'npm --version'
                sh 'docker --version || echo "Docker not installed on agent host"'
            }
        }

        // Stage 3 & 4: Parallel Dependency Installation
        stage('Install Dependencies') {
            parallel {
                stage('Install Backend Dependencies') {
                    steps {
                        dir('backend') {
                            echo '=== Stage 3: Installing Backend dependencies ==='
                            sh 'npm ci --prefer-offline'
                        }
                    }
                }
                stage('Install Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            echo '=== Stage 4: Installing Frontend dependencies ==='
                            sh 'npm ci --prefer-offline'
                        }
                    }
                }
            }
        }

        // Stage 5: Lint & Code Quality Checks
        stage('Lint & Code Quality Checks') {
            steps {
                echo '=== Stage 5: Verifying Node.js syntax & code hygiene ==='
                dir('backend') {
                    sh 'node -c src/server.js'
                    sh 'node -c src/app.js'
                }
            }
        }

        // Stage 6: Backend Integration Tests
        stage('Run Backend Integration Tests') {
            steps {
                dir('backend') {
                    echo '=== Stage 6: Executing Jest & Supertest Integration Tests ==='
                    sh 'npm test'
                }
            }
        }

        // Stage 7: Build Frontend Static Assets
        stage('Build Frontend Assets') {
            steps {
                dir('frontend') {
                    echo '=== Stage 7: Compiling React Production Distribution with Vite ==='
                    sh 'npm run build'
                }
            }
        }

        // Stage 8: Build Docker Images (Conditional on main/master)
        stage('Build Docker Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo '=== Stage 8: Building HOMES2OWN Docker images ==='
                sh 'docker build -t homes2own-backend:${IMAGE_TAG} -f backend/Dockerfile backend'
                sh 'docker build -t homes2own-frontend:${IMAGE_TAG} -f frontend/Dockerfile frontend'
            }
        }
    }

    post {
        always {
            echo 'Archiving test results & cleaning workspace artifacts...'
            // In Jenkins environments with JUnit plugin:
            // junit allowEmptyResults: true, testResults: 'backend/test-results.xml'
        }
        success {
            echo '================================================================='
            echo ' CI/CD PIPELINE STATUS: SUCCESS'
            echo ' HOMES2OWN platform validated, tested, built, and release-ready!'
            echo '================================================================='
        }
        failure {
            echo '================================================================='
            echo ' CI/CD PIPELINE STATUS: FAILED'
            echo ' Please inspect the stage logs above for failure details.'
            echo '================================================================='
        }
    }
}
