# Accelar Scripts

This is a backend meant for the Accelar team to share specific backend resources as open-source. The scripts are modular and are one part of the monolithic Accelar backend.

## Installation and dev environment

</br>

Using npm to install the dependecies (at the moment there is depeencies conflicts that will need to be resolved, so use --force)

```shell
npm install --force
```

</br>
</br>

Envs:

Copy from .env.example

</br>
</br>

Start the script or run the docker container

```shell
npm run start:dev
```
</br>
```shell
docker run -d -p 80:80 --name my-backend-container -e ENV_VAR=value my-backend-image
 ```
