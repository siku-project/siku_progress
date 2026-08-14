fx_version 'cerulean'
game 'gta5'

author 'Siku Studio'
description 'The official progress system of the SIKU ecosystem — a modern, modular and high-performance resource for immersive timed interactions, delivering seamless visual feedback, smooth animations, and consistent integration across FiveM experiences.'
version '0.0.1'

name 'siku_progress'

lua54 'yes'

shared_scripts {
  '@siku_core/init.lua',
  'config/progress.lua',
  'config/translation.lua',
  'shared/utils/locale.lua',
}

server_scripts {
  'server/init.lua',
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
