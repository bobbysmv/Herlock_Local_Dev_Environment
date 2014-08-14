#/bin/sh

# 引数 ------------------------------------------------------------

# 引数4個の時(まだタグがつけられていない状態、 初回実行)

# $1 : repository url
# $2 : next_set_tag_name
# $3 : prefix (解凍したときのディレクトリ名)
# $4 : zip_name (zipファイル名)

# 引数5個の時(既にタグがつけられている状態)

# $1 : repository url
# $2 : target_tag_name
# $3 : next_set_tag_name
# $4 : prefix (解凍したときのディレクトリ名)
# $5 : zip_name (zipファイル名)

# ----------------------------------------------------------------

# 特定タグを指定していないとき
git_flow_first() {
	local repository_url=$1
	local next_set_tag_name=$2
	local prefix=$3
	local zip_name=$4

	local base_dir=$(cd `dirname $0`; pwd)
	local clone_dir="$base_dir/clone_dir"

	# git clone
	echo "clone開始---------------"
	git clone $repository_url $clone_dir
	echo "clone終了---------------"

	## clonedirに移動
	cd $clone_dir

	# 第二引数のtag nameからリビジョンID取得
	echo "リビジョンID取得開始---------------"
	revision_id=`git show HEAD | grep commit | cut -c8- | head -n 1`

	echo $revision_id
	echo "リビジョンID取得終了---------------"

	git_flow $revision_id $next_set_tag_name $prefix $zip_name $base_dir $clone_dir
}


# 特定タグを指定している時
git_flow_update() {
	local repository_url=$1
	local target_tag_name=$2
	local next_set_tag_name=$3
	local prefix=$4
	local zip_name=$5

	local base_dir=$(cd `dirname $0`; pwd)
	local clone_dir="$base_dir/clone_dir"

	# git clone
	echo "clone開始---------------"
	git clone $repository_url $clone_dir
	echo "clone終了---------------"

	## clonedirに移動
	cd $clone_dir

	# 第二引数のtag nameからリビジョンID取得
	echo "リビジョンID取得開始---------------"
	revision_id=`git show $target_tag_name | grep commit | cut -c8- | head -n 1`

	echo $revision_id
	echo "リビジョンID取得終了---------------"


	git_flow $revision_id $next_set_tag_name $prefix $zip_name $base_dir $clone_dir
}


# 共通処理
git_flow() {
	local revision_id=$1
	local next_set_tag_name=$2
	local prefix=$3
	local zip_name=$4
	local base_dir=$5
	local clone_dir=$6


	echo "差分アーカイブ開始---------"

	$base_dir/git_diff_archive.sh $revision_id $prefix $zip_name

	# 次のタグセット
	echo "新しくタグをセット: $next_set_tag_name -------------------"
	git tag -a $next_set_tag_name -m "set tag $next_set_tag_name"
	git push origin $next_set_tag_name

	# 実行ファイルのディレクトリにzipを移動
	mv $zip_name $base_dir

	echo "差分アーカイブ終了---------"

	## 元のディレクトリに戻って諸々削除
	echo "cloenディレクトリ削除------------------"
	cd $base_dir
	rm -rf $clone_dir
}

# base_dir=$(cd `dirname $0`; pwd)
# echo $base_dir


if [ $# -eq 4 ];
then
  git_flow_first $1 $2 $3 $4
elif [ $# -eq 5 ];
then
  git_flow_update $1 $2 $3 $4 $5
else
	echo "使い方 1(初回)      : ./git_flow.sh /Users/maedatsuyoshi/Documents/git/repository/share.git v1 root zip.zip"
	echo "使い方 2(2回目以降) : ./git_flow.sh /Users/maedatsuyoshi/Documents/git/repository/share.git v1 v2 root zip.zip"
fi