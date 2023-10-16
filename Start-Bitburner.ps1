# This script is intended for Windows users running the Remote API in a docker container.
# This script will start the docker filesync container, VS Code and bitburner. 
# See the AdvancedGuide.md for more information.

# If docker not running then start docker
if ((Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue) -eq $null) {
    Write-Output "Starting Docker..."
    Start-Process -FilePath "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Start-Sleep -Seconds 5
} else {
    Write-Output "Docker process already running."
}

Write-Output "Starting bitburner-filesync container..."
# Assumes you have already built the docker image named bitburner-typescript
docker run --rm -d -v "$($pwd)/src:/app/src" -p 12525:12525 --name bitburner-filesync bitburner-typescript

# If VS Code not running start VS Code
# Assumes you have VS Code installed and a workspace file named bitburner-scripts.code-workspace
if ((Get-Process -Name "Visual Studio Code" -ErrorAction SilentlyContinue) -eq $null) {
    Write-Output "Starting VSCode..."
    Start-Process -FilePath "C:\Program Files\Microsoft VS Code\code.exe" -ArgumentList "./bitburner-scripts.code-workspace"
} else {
    Write-Output "VS Code process already running."
}

# If bitburner not running start bitburner
if ((Get-Process -Name "bitburner" -ErrorAction SilentlyContinue) -eq $null) {
    Write-Output "Starting bitburner process..."
    Start-Process -Wait -FilePath "C:\Program Files (x86)\Steam\steamapps\common\Bitburner\bitburner.exe"
} else {
    Write-Output "Bitburner process already running. Sleeping till bitburner terminates..."
    while ((Get-Process -Name "bitburner" -ErrorAction SilentlyContinue) -ne $null) {
        Start-Sleep -Seconds 30
    } 
}

# When bitburner is no longer running, automatically stop the filesync container.
Write-Output "Stopping bitburner-filesync container..."
docker stop bitburner-filesync

# Dont force terminate VS Code, there may be unsaved changes or additional changes users wants to make before closing VS Code.
Write-Output "This script will terminate when VS Code is terminated."

# There is no cli method for a graceful termination of docker desktop.
# Dont force terminate the Docker engine process itself, it will not be a graceful termination and may not work successfully as docker desktop spawns multiple processes.
