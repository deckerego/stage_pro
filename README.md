# ProPresenter Stage Monitor

This is a webapp that provides an HTML view of a ProPresenter stage screen
for ease of use with network connected confidence monitors.

This was largely created by Claude Code, with moderation and guidance
by yours truly. I wrote the README and made some tweaks to content, but
this is largely AI generated. Yeah... I know, I know.

## Running the Docker Image

To initially run this image on a machine with ProPresenter installed:
```bash
docker run --name stage_pro -p 8080:80 ghcr.io/deckerego/stage_pro:latest
```

To have the container automatically start:
```bash
docker ps | grep "stage_pro"
docker update --restart=unless-stopped stage_pro
```

