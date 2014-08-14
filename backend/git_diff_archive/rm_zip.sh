#/bin/sh

###################################################
# $1 zip_name (削除するzip名)
###################################################
rm_zip() {

	local zip_name=$1
	local base_dir=$(cd `dirname $0`; pwd)
	rm -f  "$base_dir/$zip_name"
}

if [ $# -eq 1 ];
then
	rm_zip $1
else
	echo "使い方: ./rm_zip.sh zip.zip"
fi
