// This is the start of my Jenkins Pipeline.
pipeline {
    // Jenkins can use any available computer to run my pipeline steps.
    agent any

    // Removed direct definition of BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY here.
    // This environment block is now empty or can be used for other non-credential environment variables.
    environment {
    } // 

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

                 // Added withCredentials block to handle username/password credential
                // This block securely retrieves and exposes the BrowserStack username and access key
                // as environment variables for the commands within this block.
                // 'browserstack-auth' should be the ID of your 'Username with password' credential in Jenkins.
                withCredentials([usernamePassword(credentialsId: 'browserstack-auth', usernameVariable: 'BS_USERNAME', passwordVariable: 'BS_ACCESS_KEY')]) {
                    // I'm adding these console.log statements to check what Node.js actually sees for my credentials.
                    // Jenkins will mask the actual values in the logs for security.
                    sh 'echo "BROWSERSTACK_USERNAME: $BS_USERNAME"' // <--- CHANGE: Variable name changed to BS_USERNAME
                    sh 'echo "BROWSERSTACK_ACCESS_KEY: $BS_ACCESS_KEY"' // <--- CHANGE: Variable name changed to BS_ACCESS_KEY
                    sh 'curl -v https://hub-cloud.browserstack.com/wd/hub' // I'm checking if my Jenkins server can connect to the BrowserStack hub.

                    // Now run Mocha, passing the credentials explicitly via cross-env
                    // Note the variable names are now BS_USERNAME and BS_ACCESS_KEY
                    sh 'npx cross-env BROWSERSTACK_USERNAME=$BS_USERNAME BROWSERSTACK_ACCESS_KEY=$BS_ACCESS_KEY npx mocha Tests/loginFavoriteSamsung.test.js' // <--- CHANGE: Variable names changed to BS_USERNAME and BS_ACCESS_KEY
                } // 
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
