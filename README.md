# CarPark
An automated carpark (parking garage) control system.  
Requirements for the system are expressed in a [document](https://github.com/MaileTechnical/CarPark/blob/master/CarPark-SRS.pdf) within this repository.
## License
This is Open Source Software (OSS) licensed under Apache 2.0 (http://www.apache.org/licenses/LICENSE-2.0). 

Documentation is licensed under Creative Commons (https://creativecommons.org/).
## Configurations
The following configurations exist:
1. Interactive Testing.  Explicitly models interacting entities in a modeled test bench, enabling testing with Verifier and Ciera-generated code using `pom-testbench.xml`.  Note that the name dates to when individual test functions were invoked manually; a state machine-driven test bucket now automates test case execution.
2. Automated Testing.  Intended for regression testing with both Verifier and generated code, this configuration employs a modeled test suite covering many use cases.  Use `pom-autotest.xml` for this one.
3. Browser-based Clients.  Leverages browser-based clients representing system peripherals such as entry and exit stands, payment machines, and an operator console.  Intended for testing and demonstration of code generated from the xtUML model of the carpark control system connected to externally produced code.  Use `pom-clients.xml` for this configuration.  

Note: the Interactive Testing test bench, an earlier creation, uses 'concrete' models of the entities which interact with the control system - the entry/exit stands, a patron, etc. Automated testing, a later effort, adopts a more abstract approach with a test bench that models interactions with the control system and uses an application-independent test framework for test case sequencing.

## Populating a Workspace
Instructions for populating a workspace for each configuration are provided below.  In all cases, the "CarPark" project referred to below is the xtUML project by that name, not the top-level directory which happens to have the same name.  The import wizard lists each project in the repository as "CarPark/\<projectName>", so the "CarPark" project referred to below is shown as "CarPark/CarPark".

The built-in external entities provided by BridgePoint 7 (or later) can be added to a workspace as follows:
1. Create an xtUML project named *BuiltInEEs*.
2. Add a package named *EEs* to the *BuiltInEEs* project.
3. Select the *EEs* folder and select the context menu entry (right-click) for "Add Built-in External Entities".
### Interactive Testing
1. Add the built-in external entities provided by BridgePoint 7 or later.
2. Import the following projects from this repository:
- CarPark
- InteractiveTesting
### Automated Testing
1. Add the built-in external entities provided by BridgePoint 7 or later.
2. Import the TestFramework project from the [TestFramework repository.](https://github.com/MaileTechnical/TestFramework)
3. Import the following projects from this repository:
- CarPark
- CarParkTestbench
### Browser-based Clients
1. Add the built-in external entities provided by BridgePoint 7 or later.
2. Import the following projects from this repository:
- CarPark
- Deployment
- Intercom
- TestControl
## Running the Application on Verifier
As part of creating a debug configuration, the specific configuration of the application to be executed must be specified.  This is accomplished by selecting a **package** containing a collection of component references connected through ports.  
### Interactive Testing
1. Create a debug configuration of type "xtUML eXecute Application" and name it Carpark-InteractiveTest
2. Enable "Log model execution activity"
3. Disable "Run deterministically"
4. Disable "Enable simulated time"
5. Select the InteractiveTesting configuration **package** within the InteractiveTesting **xtUML project**
6. Run Verifier using this debug configuration
7. Execute either of the RunXxx operations defined on the NominalBucket in TestCases_Nominal package.
### Automated Testing
1. Create a debug configuration of type "xtUML eXecute Application" and name it Carpark-AutoTest
2. Enable "Log model execution activity"
3. Disable "Run deterministically"
4. Disable "Enable simulated time"
5. Select the AutoTest configuration **package** within the CarParkTestbench **xtUML project**
6. Run Verifier using this debug configuration 
7. Execute any one of the functions found in TestFunctions package.
## Build and Run with Ciera
Note that it is not necessary to invoke BridgePoint or import projects into a workspace before building with Ciera.  After cloning the relevant repositories, just follow the instructions for building the configuration of interest.  In addition to this repository, the [TestFramework repository.](https://github.com/MaileTechnical/TestFramework) must also be cloned to build and run the automated testing configuration. 
### Interactive Testing
Within the top-level (git repo) directory:
1. Select the interactive testbench configuration by issuing the command `cp pom-testbench.xml pom.xml`.
2. Execute `mvn clean install`.  
3. Execute `bash ./run-test-servlet.sh`.
4. Verify "bucket successful" appears in console log.
### Automated Testing
Within the top-level (git repo) directory:
1. Select the automated testbench configuration by issuing the command `cp pom-autotest.xml pom.xml`.
2. Execute `mvn clean install`.  
3. Execute `bash ./run-autotest-servlet.sh`.
4. Verify that 3 test cases have passed in the summary report in the console log.
### Browser-based Clients
Within the top-level (git repo) directory:
1. Select the browser-based client configuration by issuing the command `cp pom-clients.xml pom.xml`.
2. Execute `mvn clean install`.  
3. Execute `bash ./run-clients-servlet.sh`.
4. Verify a transition in the console log indicating the Carpark is operating.
5. Open at least one of each type of client in a browser:  localhost:8080/*clientType*.html where *clientType* is one of TestControl, OperatorConsole, EntryStand, ExitStand, PaymentMachine.
6. The current version of the application contains a fee schedule supporting a single day, April 1, 2025. Use the TestControl client to set the current date and time (as seen by the application) to something between 6:00 a.m. and 6:00 p.m. on this day.
7. Use the clients to execute and observe use cases.  For example, you might use the entry stand to put a car into the carpark, then use the test control to advance time (simulating a stay of a specified duration), then use the payment machine to pay for the stay, then use the test control to advance time again (simulating the time elapsed between paying for the stay and exiting the carpark), and finally use the exit stand to make the vehicle exit the carpark.
## Issues
Please open issues for defects and feature requests within the GitHub issues database for this repository.
## Contributions
To contribute enhancements or defect resolutions, please follow this simple process:
1. Open an issue.  Each issue should cover a single defect or enhancement.
2. On your personal fork of the repository, create a branch named <issueNumber>_<short description of defect or enhancement> and make the changes on this branch.
3. Test your changes on all configurations.
4. Issue a pull request for your branch.
