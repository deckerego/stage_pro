# ProPresenter Stage Monitor

This is a webapp that provides an HTML view of a ProPresenter stage screen
for ease of use with network connected confidence monitors.

This was largely created by Claude Code, with moderation and guidance
by yours truly. I wrote the README and made some tweaks to content, but
this is largely AI generated. Yeah... I know, I know.

## Running the Docker Image

To initially run this image on a machine with ProPresenter installed, 
launch the container on the command line:
```bash
docker run -e PROPRESENTER_PORT=50311 --name stage_pro -p 8080:80 ghcr.io/deckerego/stage_pro:latest
```
Note that the `PROPRESENTER_PORT` changes from installation to installation,
so check the "Port" value under the network settings in ProPresenter.

To have the container automatically start:
```bash
docker update --restart=unless-stopped stage_pro
```

