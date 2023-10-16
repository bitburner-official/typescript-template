# Advanced Setup Guide

This guide is mostly focused on Windows users (Mac instructions are given at some places).
If you're a Linux/Mac/Other user, there's an expectancy that you know your system and it's peculiarities compared to Windows.
If you need help with your particular system, feel free to ask for help in the Official Bitburner Discord.

## Running Remote API file sync in Docker

Docker is a virtualization layer that allows you to separate applications from underlying local host infrastructure, making application environments consistent and easier to manage. 

You may want to use an isolated docker container for the Remote API instead of installing nodejs with the Remote API dependencies locally on your computer, however if you are not familiar with docker then the [Beginners Guide](BeginnersGuide.md) manual setup is available.

This guide assumes you are familiar with docker fundamentals. You may need to modify these steps if using a Mac or if you want to include different docker options.

### 1. Backup your savegame (just in case) 
- Augmentations -> Backup save

### 2. Install Docker Desktop (if not already installed)
- Go to https://www.docker.com/products/docker-desktop/ 
- Download the version that's recommended for your OS.
- Install it. Just click next, next, next, next, finish.

### 3. Download this project from GitHub:
- Go to https://github.com/bitburner-official/typescript-template  
- Click the green 'Code' button
- If you're unfamiliar with Git and have no intention to use it:
  - Press the Download Zip button
  - Extract the zip anywhere, for example `C:\Users\yourusername\Workspace\BitburnerScripts` on Windows or `~/Workspace/BitburnerScripts` on Other

### 4. Open a PowerShell terminal pointed at your workspace
- Open a PowerShell terminal
  - Windows: Open start menu and type `powershell` (enter)  
- Go to the directory you just created:  
  - Type `cd C:\Users\yourusername\Workspace\BitburnerScripts` or whatever folder you chose previously.  

### 5. Build the bitburner-typescript docker image
- Enter the following command in the PowerShell terminal:

   ```docker build -t bitburner-typescript .```
	
### 6. Run the filesync service using the bitburner-typescript image
- Enter the following command in the PowerShell terminal:

  ```docker run --rm -d -v "$($pwd)/src:/app/src" -p 12525:12525 --name bitburner-filesync bitburner-typescript```
- In the PowerShell terminal the `$($pwd)` resolves to the current directory but you can modify the command with full file path to the src directory if required.
- When the container starts the container logs may show "`error TS2307: Cannot find module '@ns' or its corresponding type declarations`", this is fine. The missing type declaration `NetscriptDefinitions.d.ts` will be downloaded from the game once successfully connected to bitburner.

### 7. Go back to Bitburner and configure the remote API connection
- Bitburner sidebar menu -> Options -> Remote API -> type in the port: `12525` -> click connect. The icon should turn green and say it's online.
- Your firewall may yell at you again; allow the connection.

### 8. Test that the connection works
- You should see a file `template.js` in the root of your `home` server in Bitburner.

### 9. Try some other files too!
- Copy/create a .js or .ts file to the `src` folder on your computer and check Bitburner. The file should be transferred!
	
### 10. Thats it!
- You can now make and edit the files in the `src` directory to your liking, and have them be changed in Bitburner automatically.
- You may want to manually stop the docker filesync container when you are done playing bitburner - or automate the docker start/stop with PowerShell desktop shortcut!
- `docker stop bitburner-filesync`

## Launch Bitburner, VS Code and the filesync docker container!

Playing bitburner with an external editor is cool, but each time you want to play bitburner you need to start the docker engine, run the filesync container, open your editor (e.g. VS Code) and your bitburner scripts workspace, and then launch the bitburner game. Phew! If only all that could be automated too...

The [Start-Bitburner.ps1](Start-Bitburner.ps1) PowerShell script will launch everything with one click; it will start the docker engine, start the file sync container, open the VS Code bitburner workspace and launch the bitburner game. 

Create a Windows desktop shortcut that targets PowerShell.exe with the path to the Start-Bitburner.ps1 as an argument. The desktop shortcut properties 'Target' should be something like the following (you may need to set absolute paths):

> powershell.exe Start-Bitburner.ps1 

You can also change the icon so that the desktop shortcut has the bitburner icon instead of a PowerShell icon e.g. select 'Change Icon' and browse for "C:\Program Files (x86)\Steam\steamapps\common\Bitburner\bitburner.exe".


### For more information
Read the readme of this https://github.com/bitburner-official/typescript-template and feel free to ask in Bitburner Discord channel `#external-editors:` https://discord.com/channels/415207508303544321/923428435618058311
