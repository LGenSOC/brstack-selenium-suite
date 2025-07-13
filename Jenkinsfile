// This is the start of my Jenkins Pipeline.
pipeline {
    // Jenkins can use any available computer to run my pipeline steps.
    agent any

    // Removed direct definition of BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY here.
    // This environment block is now empty or can be used for other non-credential environment variables.


    // These are the main parts (stages) of my pipeline.
    stages {
        // --- Stage 1: Get My Code ---
        stage('Checkout Code') {
            steps {
                // I download my project code from GitHub.
                // IMPORTANT: This MUST match your GitHub's default branch.
                git url: 'https://github.com/LGenSOC/brstack-selenium-suite.git',
                    branch: 'master' // <--- Ensure this is 'master' or 'main' as per your GitHub repo
            }
        }

        // --- Stage 2: Install Project Tools ---
        stage('Install Dependencies') {
            steps {
                // Let's see where Jenkins is and what files are here!
                sh 'pwd'
                sh 'ls -la' // List all files and directories in the current working directory
                // I run 'npm install' to get all the necessary Node.js packages.
                sh 'npm install'
            }
        }

// --- Stage 3: Run My Tests ---
        stage('Run Tests on BrowserStack') {
            steps {
                // Let's confirm it's there with the correct casing
                sh 'ls -la Tests/'

                // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                // NEW: Securely inject BrowserStack credentials from Jenkins vault
                withCredentials([usernamePassword(
                    credentialsId: 'browserstack-auth', // Must match your Jenkins credential ID
                    usernameVariable: 'BROWSERSTACK_USERNAME', 
                    passwordVariable: 'BROWSERSTACK_ACCESS_KEY'
                )]) {
                    // DEBUG: Verify credentials are loaded (masked in logs)
                    sh 'echo "Jenkins injected BROWSERSTACK_USERNAME: $BROWSERSTACK_USERNAME"'
                    sh 'echo "Jenkins injected BROWSERSTACK_ACCESS_KEY length: ${#BROWSERSTACK_ACCESS_KEY} chars"'

                    // Original test command now uses Jenkins-provided credentials
                    sh 'npx cross-env BROWSERSTACK_USERNAME=$BROWSERSTACK_USERNAME BROWSERSTACK_ACCESS_KEY=$BROWSERSTACK_ACCESS_KEY npx mocha Tests/loginFavoriteSamsung.test.js'
                }
                // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            }
        }
    }

    // This section runs after all stages, for cleanup.
    post {
        always {
            // I clean up my project's workspace.
            cleanWs()
        }
    }
}
