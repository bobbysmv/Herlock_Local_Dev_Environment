## メモ 

共有レポジトリからgitプロジェクトをcloneして特定のタグから最新までの変更差分のみを
zipに固めるバッチ処理


- git_flow.sh
  - git_diff_archive.shを内部的に呼び出している。
  - 以下の一連の流れをgit_flow.sh内で行っている。
    - 引数として以下を受け取る
      - レポジトリURL
      - 差分を取得する際の基準のTAG名
      - 一通りの処理が終わったセットするタグ名
      - zipファイルを解凍した際のディレクトリ名
      - zipファイル名
    - レポジトリURLを元にプロジェクトをcloneする
    - cloneしてきたプロジェクトに移動して基準タグ名を元にリビジョンIDを取得する
    - 取得したリビジョンIDと現在までの修正差分をzipに固める(git_diff_archive.shを呼ぶ)
    - 新しいタグをセットする
    - zipファイルを実行ファイルと同じディレクトリに移動する
    - cloneしたディレクトリを削除する
- git_diff_archive.sh
  - git_flow.sh内部から使われる事のみを想定
  - 単体でも動くと思う。
  - 引数は以下の通り
    - リビジョンID
    - 差分zipを解凍したときのディレクトリ名
    - zipファイル名


### ファイル内容

========================================================================
git_flow.sh
========================================================================

```

#/bin/sh

# 引数 ------------------------------------------------------------

# $1 : repository url
# $2 : target_tag_name
# $3 : next_set_tag_name
# $4 : prefix (解凍したときのディレクトリ名)
# $5 : zip_name (zipファイル名)

# ----------------------------------------------------------------


git_flow() {
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

if [ $# -eq 5 ]; 
then
  git_flow $1 $2 $3 $4 $5
else
	echo "引数エラー 1: repository url, 2: target_tag_name, 3: next_set_tag_name, 4: prefix 5: zip_name"
	echo "使い方 : ./git_flow.sh /Users/maedatsuyoshi/Documents/git/repository/share.git v1 v2 root zip.zip"
fi


```

========================================================================
git_diff_archive.sh
========================================================================

```

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

```
