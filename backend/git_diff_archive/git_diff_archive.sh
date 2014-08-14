#/bin/sh

# 引数 ------------------------------------------------------------

# $1 : revision
# $2 : prefix (解凍したときのディレクトリ名)
# $3 : zip_name (zipファイル名)

# ----------------------------------------------------------------



git_diff_archive()  {
	local revision=$1
	local prefix=$2
	local zip_name=$3

	diff="git diff --name-only $revision HEAD"

	git archive --format=zip --prefix="$prefix/" HEAD `eval $diff` -o $zip_name
}


if [ $# -eq 3 ];
then
	echo "アーカイブ開始---------"

	git_diff_archive $1 $2 $3

	echo "アーカイブ終了---------"
else
	echo "引数エラー 1: コミットリビジョン, 2: zipに固める際のディレクトリ名 3: zipファイル名"
	echo "使い方 : ./git_diff_archive.sh 18ea21f root zip.zip"
fi
