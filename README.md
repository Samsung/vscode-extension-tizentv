<h1 align="center">
  <br>
    <img src="https://raw.githubusercontent.com/samsung/vscode-extension-tizentv/master/images/icon.png?branch=master" alt="logo" width="200">
  <br>
  VS Code - TizenTV
  <br>
  <br>
</h1>

<h4 align="center">Generate/Edit/Package/Launch(Run, Debug) your applications with Tizen Targets</h4>

'TizenTV' is a VS Code extension that provides a lightweight IDE for Tizen application developers, helps to generate, update and package an application, also launch (run, debug mode) an application on Tizen targets.

![Demo](https://raw.githubusercontent.com/samsung/vscode-extension-tizentv/master/images/demo.gif)

## Supported features 

* Tizen TV: Create Web Project  
  Create a Tizen web application based on templates
* Tizen TV: Run Certificate Manager  
  Create/Retrieve/Update/Delete an author's profile by tizentv
* Tizen TV: Build Signed Package  
  Build the Tizen application into a Tizen package, the package will be located in workspace's root 
* Tizen TV: Launch Application  
  Launch Tizen application on tizen TV, TV Emulator or TV Simulator, please configure the target address in user setting, also set TV as developer mode  
* Tizen TV: Debug Application
  Use google-chrome to debug with web inspector, please configure the chrome executable's path in user setting 
* Tizen TV: Show Output
  Open Tizen TV output channel for details
* Tizen TV: Wits Start (Install and Live reload)
  Development tool for helping to run and develop your Tizen web application easily on your 2017+ Samsung TV. Find more details about Wits at *https://github.com/Samsung/Wits*
* Tizen TV: Wits Watch (Live reload)  
  Run `live reload` without installing the package again.
* Tizen TV: Wits Stop  
  Stop `live reload` feature.
* Tizen TV: Wits Show Output  
  Open Wits output channel for details
* Tizen TV: Set Target Device Address
  Set Target device address to launch application.

## Getting Started
The extension supports most of the basic features required to develop a Tizen TV app. It supports to create application using predefined templates, package the application, sign the application using certificate profile, launch (run / debug) application on TV Simulator, Emulator and Tizen TV.

### Setup Environment  
1. Install latest VS Code release  
   *https://code.visualstudio.com*  
   *https://code.visualstudio.com/docs/setup/setup-overview* 
2. Execute *ext install tizentv* in command pallete(or clone tizentv-x.x.x.vsix from github, install with terminal command)  
   *#code --install-extension tizentv-x.x.x.vsix*  
3. Start or Reload VS Code  
4. Use F1 to open the palette and input *>Tizen TV* to find commands
   
<p><img src="https://raw.githubusercontent.com/samsung/vscode-extension-tizentv/master/images/commands.png" alt="commands"></p>

### Command Configuration  
For running/debugging an app, please configure one of below items:  
File > Preferences > User Settings or Code > Preferences > User Settings  
* tizentv.hostPCAddress  
  Configuration of user's host PC IP address  
* tizentv.targetDeviceAddress  
  Configuration of target TV's IP address  
* tizentv.simulatorExecutable
  Configuration of TV simulator's executable location 
* tizentv.excludeFiles 
  Add files should be excluded
* tizentv.chromeExecutable  
  Configuration of chrome executable's path

<p><img src="https://raw.githubusercontent.com/samsung/vscode-extension-tizentv/master/images/setting.png" alt="setting"></p>

## F.A.Q
Please get contact points at below:  
`sejung.chang@samsung.com`
`woosik.park@samsung.com`  
`hyojins.kim@samsung.com`

