# Docker Setup Guide

This guide is mostly focused on Windows users (Mac instructions are given at some places).
If you're a Linux/Mac/Other user, there's an expectancy that you know your system and it's peculiarities compared to Windows.

> This guide assumes you have a basic understanding of docker concepts and will be using Docker Desktop for Windows. If you want to use an alternative container management solution e.g. podman, there's an expectancy that you know your system and it's peculiarities compared to Docker Desktop.

**Use of docker is completely optional**. If you are not familiar with docker, or do not intend to run the file sync in a container, the [Beginners Guide](BeginnersGuide.md) manual setup is available.

If you need help with your particular system, feel free to ask for help in the Official Bitburner Discord.

## Running Remote API file sync in Docker

Docker is a virtualization layer that allows you to separate applications from underlying local host infrastructure, making application environments consistent and easier to manage. 

You may want to use an isolated docker container for the Remote API instead of installing nodejs with the Remote API dependencies locally on your computer. 

> This guide assumes you are familiar with docker fundamentals. You may need to modify these steps if using an alternative container management solution or if you want to include different docker options.

### 1. Backup your saved game (just in case) 

- Bitburner > Options sidebar > click Export Game button.

### 2. Install Docker Desktop (if not already installed)
- Go to https://www.docker.com/products/docker-desktop/ 
- Download the version that's recommended for your OS.
- Install it. Just click next, next, next, next, finish.

### 3. Clone or download this project from GitHub:
- Go to https://github.com/bitburner-official/typescript-template  
- Click the green 'Code' button
- If you are familiar with Git, clone the repository using the appropriate remote URL.
- If you're unfamiliar with Git and have no intention to use it, download the ZIP and extract it somewhere on your computer.

### 4. Create `NetscriptDefinitions.d.ts` file for intellisense auto-complete

- The definitions file is used for 'intellisense' or auto-complete in text editors.
- Create a file named `NetscriptDefinitions.d.ts` in your workspace. This is case sensitive. The contents of the file will be overwritten when you connect to bitburner so it doesn't matter what the file is, as long as it exists. The file should be in your project directory (same location as Dockerfile). 
- If the file does not exist, the volume bind mount in the docker command will create a directory named `NetscriptDefinitions.d.ts` instead of a file, which is not what we want!

	
### 5. Run the bitburner-filesync docker container 
- Start a command prompt / PowerShell / terminal session in your project workspace and enter:

   ```docker build -t bitburner-typescript .```

- Enter the following command to run the bitburner-filesync container using the bitburner-typescript image created above:

  ```docker run --rm -d -v "$($pwd)/src:/app/src" -v "$($pwd)/NetscriptDefinitions.d.ts:/app/NetscriptDefinitions.d.ts" -p 12525:12525 --name bitburner-filesync bitburner-typescript```

> NOTE: In a PowerShell terminal the `$($pwd)` resolves to the current directory but you can modify the command with full file path to the src directory if required.

> NOTE: If you view the container logs they may show "`error TS2307: Cannot find module '@ns' or its corresponding type declarations`". This is fine, the `NetscriptDefinitions.d.ts` will be downloaded from the game once successfully connected to bitburner.

### 6. Start Bitburner and configure the remote API connection
- Bitburner > Options sidebar > Remote API > type in the port `12525` and click connect. The icon should turn green and say it's online.
> NOTE: Your firewall may yell at you; allow the connection.

### 7. Test that the connection works
- In bitburner > terminal > enter `home` and then `ls` to list files on your home server. 
- You should see the `src/template.ts` file from your local workspace was automatically compiled to `template.js` and synced to the root of your `home` server in Bitburner.
- In bitburner > terminal > enter `run template.js` and it should print the message `Hello Remote API!`.
- Edit the message in the original `src/template.ts` file in your local workspace (using your preferred text editor) and and save the file. 
- The change should automatically sync to bitburner. In bitburner repeat `run template.js` and it should print your new message. 

### 8. Thats it!
- You can now make and edit the files in your local `src` workspace, and they will be synced to Bitburner automatically.
> NOTE: do not use the internal bitburner 'nano' editor to change the files. You can use the 'nano' editor to view files but the remote API file sync is one way only, changes made in the bitburner 'nano' editor are not synced back to your local `src` workspace.
- You may want to manually stop the docker filesync container when you are done playing bitburner:

  `docker stop bitburner-filesync`

## Launching Bitburner, VS Code and the filesync docker container!

Playing bitburner with an external editor is cool, but each time you want to play bitburner you need to start the docker engine, run the filesync container, open your editor (e.g. VS Code) and your bitburner scripts workspace, and then launch the bitburner game. Phew! If only all that could be automated too...

You may want to create a PowerShell, python or other batch script that will launch everything with one click. This is beyond the scope of this guide given that everyone may have their own favourite text editor, container management solution, and custom installation directories.


### For more information
Read the readme of this https://github.com/bitburner-official/typescript-template and feel free to ask in Bitburner Discord channel `#external-editors:` https://discord.com/channels/415207508303544321/923428435618058311
