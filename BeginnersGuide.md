# Step by step guide to setting up the Typescript template from scratch
This guide is mostly focused on Windows users (Mac instructions are given at some places).
If you're a Linux/Mac/Other user, there's an expectancy that you know your system and it's peculiarities compared to Windows.
If you need help with your particular system, feel free to ask for help in the Official Bitburner Discord.

Alternatively if you are familiar with docker, see [Docker install guide](DockerGuide.md) (optional) that installs nodejs and the Remote File API in an isolated container.

### 1. Backup your savegame (just in case) 
- Augmentations -> Backup save

### 2. Install Node.js
- Go to https://nodejs.org/en/  
- Download the version that's recommended for most users.
- Install it. Just click next, next, next, next, finish.
	
### 3. Download this:
- Go to https://github.com/bitburner-official/typescript-template  
- Click the green 'Code' button
- If you're unfamiliar with Git and have no intention to use it:
  - Press the Download Zip button
  - Extract the zip anywhere, for example `C:\Users\yourusername\Workspace\BitburnerScripts` on Windows or `~/Workspace/BitburnerScripts` on Other

### 4. Open a terminal pointed at your scripts folder
- Open command prompt / terminal
  - Windows: Open start menu and type `cmd` (enter)  
  - Mac: Click the Launchpad icon in the Dock, type `Terminal` in the search field, then click Terminal.
- To go to the directory you just created:  
  - Windows: Type `cd ` and drag the folder you created to the cmd window, or type `cd C:\Users\yourusername\Workspace\BitburnerScripts` or whatever folder you chose previously.  
  - Mac: Type `cd ` and drag the folder you created to the terminal window, or type `cd ~/Workspace/BitburnerScripts` or whatever folder you chose previously.

### 5. Install the needed programs
- type `npm install`

### 6. Starting the watch services
- In the terminal you opened, run the command `npm run watch` in your folder.
- If NPM asks if you want to install something it needs, answer `y` for yes.
- Your firewall may yell at you; allow the connection.
- If the terminal shows `error TS2307: Cannot find module '@ns' or its corresponding type declarations.` (or see the same error at your editor), it is fine. The missing type declaration `NetscriptDefinitions.d.ts` will be downloaded from the game once connected.

### 7. Go back to Bitburner.
- Options -> Remote API -> type in the port: `12525` -> click connect. The icon should turn green and say it's online.
- Your firewall may yell at you again; allow the connection.

### 8. Test that the connection works
- You should see a file `template.js` in the root of your `home` server in Bitburner.
- You should see a NetscriptDefinitions.d.ts automatically appear in the folder on your computer (ex. `C:\Users\yourusername\Workspace\BitburnerScripts\NetscriptDefinitions.d.ts`).

### 9. Try some other files too!
- Copy/create a .js or .ts file to the `src` folder on your computer and check Bitburner. The file should be transferred!
	
### 10. Thats it!
- You can now make and edit the files in the `src` directory to your liking, and have them be changed in Bitburner automatically.
<br />
<br />

### For more information
Read the readme of this https://github.com/bitburner-official/typescript-template and feel free to ask in Bitburner Discord channel `#external-editors:` https://discord.com/channels/415207508303544321/923428435618058311
