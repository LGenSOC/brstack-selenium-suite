// This is the start of my Jenkins Pipeline.
pipeline {
    // Jenkins can use any available computer to run my pipeline steps.
    agent any

    // This section sets up my secret keys for BrowserStack.
    environment {
        BROWSERSTACK_USERNAME = credentials('browserstack-username')
        BROWSERSTACK_ACCESS_KEY = credentials('browserstack-access-key')
    }

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

                // I'm adding these console.log statements to check what Node.js actually sees for my credentials.
                // Jenkins will mask the actual values in the logs for security.
                sh 'echo "BROWSERSTACK_USERNAME: $BROWSERSTACK_USERNAME"'
                sh 'echo "BROWSERSTACK_ACCESS_KEY: $BROWSERSTACK_ACCESS_KEY"'
                sh 'curl -v https://hub-cloud.browserstack.com/wd/hub' // I'm checking if my Jenkins server can connect to the BrowserStack hub.

        
                sh 'npx cross-env BROWSERSTACK_USERNAME=$BROWSERSTACK_USERNAME BROWSERSTACK_ACCESS_KEY=$BROWSERSTACK_ACCESS_KEY npx mocha Tests/loginFavoriteSamsung.test.js'
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
