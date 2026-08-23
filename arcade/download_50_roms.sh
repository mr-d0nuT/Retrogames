#!/bin/bash
mkdir -p roms
cd roms
baseUrl="https://archive.org/download/MAME_2003-Plus_Reference_Set_2018/roms/"
for rom in mslug mslug2 mslugx sf2 sf2ce ssf2t xmcota msh xmvsf marvelvs kof97 kof98 kof99 fatfury2 samsho samsho2 samsho3 samsho4 garou mk mk2 umk3 avsp dino punisher ffight captcomm knights kod wof tmnt tmnt2 simpsons xmen mystwarr vendetta ddragon ddragon2 goldenax altbeast astorm ssriders toki rastan ghouls mwalk snowbros tumblep pang spang
do
    echo "Descargando $rom.zip..."
    curl -L -O "$baseUrl$rom.zip"
done
echo "¡Completado!"
