// This is the start of my Jenkins Pipeline.
// A pipeline is a set of automated steps that Jenkins will follow.
pipeline {
    // 'agent any' means Jenkins can use any available computer to run my pipeline steps.
    agent any// This section is for setting up special information, like my secret keys.
    environment {
        // I tell Jenkins to get my BrowserStack username from its secure storage.
        // I named this secret 'browserstack-username' in Jenkins.
        BROWSERSTACK_USERNAME = credentials('browserstack-username')

        // I tell Jenkins to get my BrowserStack access key from its secure storage.
        // I named this secret 'browserstack-access-key' in Jenkins.
        BROWSERSTACK_ACCESS_KEY = credentials('browserstack-access-key')
    }
    // This section defines the main parts (stages) of my pipeline.
    stages {
        // --- Stage 1: Get My Code ---
        stage('Checkout Code') {
            steps {
                // This step tells Jenkins to download my project code from GitHub.
                // I tell it the link to my GitHub repository.
                git url: 'https://github.com/LGenSOC/brstack-selenium-suite.git',
                    // And I tell it which branch to get the code from (usually 'main').
                    branch: 'master'
            }
        }
        // --- Stage 2: Install Project Tools ---
        stage('Install Dependencies') {
            steps {
                // This command tells Jenkins to run 'npm install'.
                // 'npm install' downloads all the necessary Node.js packages (like Selenium)
                // that my project needs to run.
                sh 'npm install'
            }
        }
        // --- Stage 3: Run My Tests ---
        stage('Run Tests on BrowserStack') {
            steps {
                // This command tells Jenkins to run 'npm test'.
                // My 'package.json' file already knows that 'npm test' means
                // "run my Selenium tests using Mocha".
                // Jenkins automatically gives my test script the BrowserStack username and key
                // that I set up in the 'environment' section.
                sh 'npx mocha tests/loginFavoriteSamsung.test.js'
            }
        }
    }
// This section defines what Jenkins should do AFTER all the main stages are finished,
    // no matter if the tests passed or failed.
    post {
        always {
            // This command tells Jenkins to clean up my project's workspace.
            // It removes temporary files and downloaded packages to keep things tidy for the next build.
            cleanWs()
            // (I could add other things here, like sending a message if the build failed.)
        }
    }
}
