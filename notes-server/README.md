## Development

- Only for linux systems. Windows systems not tested.
- On every commit prettier will do the auto formatting on staged files.

### Running Server

**Required files**
These are the required files which should be present in the root directory. Ask any developer for the files.

- .env with all the necessary parameters. [Variables are mentioned here](https://api.cloudphysicianworld.org/en/config/env).
- iot-certs directory with three files.
- Google auth file.

#### Without Docker

**Prerequisites**

- node v14
- All the required files in root directory

**Steps**

- Install node modules if not done - `npm install`
- From root directory run this command - `npm run start-esm`

#### With Docker

**Prerequisites**

- docker, docker compose, and aws cli
- ecr is logged in
- All the required files in root directory
- Install prettier - `npm install -g prettier` Use sudo if necessary. There is one limitation with current docker approach. So prettier is still needed in host machine.

**Steps**

- Run the command from the root directory - `docker-compose -f ./.docker/docker-compose.yml up`
- For first time it will take time since it will download and install all the necessary images and packages. After that it will be faster.
- After few minutes server should start. You should be able to see the logs in terminal.
