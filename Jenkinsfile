pipeline {
    agent any

    environment {
        NODE_ENV = 'test'
        CI = 'true'
        DB_CLIENT = 'sqlite'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source repository from Git...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            echo 'Installing Backend packages with npm ci...'
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            echo 'Installing Frontend packages with npm ci...'
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Run Automated Tests') {
            steps {
                dir('backend') {
                    echo 'Executing Jest and Supertest integration tests...'
                    sh 'npm test'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    echo 'Compiling React production bundle with Vite and Tailwind CSS...'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    echo 'Validating backend entry point and syntax check...'
                    sh 'node -c src/server.js'
                    sh 'node -c src/app.js'
                }
            }
        }
    }

    post {
        success {
            echo '=================================================='
            echo ' CI PIPELINE SUCCESS: All tests passed & built!   '
            echo ' Application is ready for Dockerized deployment.  '
            echo '=================================================='
        }
        failure {
            echo '=================================================='
            echo ' CI PIPELINE FAILED: Inspect build/test logs.     '
            echo '=================================================='
        }
    }
}
