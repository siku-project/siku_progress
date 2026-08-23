fx_version 'cerulean'
game 'gta5'

author 'Siku Studio'
description 'The official progress system of the SIKU ecosystem — a modern, modular and high-performance resource for immersive timed interactions, delivering seamless visual feedback, smooth animations, and consistent integration across FiveM experiences.'
version '1.0.0'

name 'siku_progress'

lua54 'yes'

shared_scripts {
  '@siku_core/init.lua',
  'config/control.lua',
  'config/loading.lua',
  'config/progress.lua',
  'config/steps.lua',
  'config/translation.lua',
}

server_scripts {
  'server/init.lua',
  'server/main.lua',
}

client_scripts {
  'client/main.lua',
}

ui_page 'web/dist/index.html'

files {
  'translations/*.lua',
  'web/dist/**/*',
}

dependencies {
  'siku_core',
}
