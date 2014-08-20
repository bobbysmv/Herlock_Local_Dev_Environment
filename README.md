#Herlockローカル開発環境

## インストール・起動


依存packageをインストールする

```
$ npm install
```

サーバーを立ち上げる。

```
$ node ./
```

ブラウザで http://マシンのIP:8080/ にアクセス


## プロジェクトの追加


- ./projects直下にプロジェクト毎のディレクトリを用意する。

- 作成したディレクトリ直下にアプリを起動するための.js(main.js)を配置する。

## 機能

#### HTTPサーバー 

- ブラウザUIの提供

- 確認環境（開発アプリ・webpreview）がローカルソースを参照するのに使用

#### web preview

- HerlockのHTML5プレーヤーを使いpreviewする。

- webアプリと同様のJSデバッグが可能

#### javascript documentor

- project毎にjsソースからドキュメントを生成する。

- jsduck(5.1.0以上)を利用

#### 開発用アプリInspector

- 開発用アプリと接続し、デバッグを行う。
　　
#### web editor

- ブラウザ上でソースの編集が可能

- eclipse orionを利用


## その他

※node v0.10.26で動作確認済み
