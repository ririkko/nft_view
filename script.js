let html5QrCode = new Html5Qrcode("qr-reader");
let isCameraActive = true; // カメラの状態管理
let errorShown = false; // エラーを一度だけ表示するためのフラグ

// QRコードスキャン成功時の処理
function onScanSuccess(decodedText, decodedResult) {
    console.log(`QRコードスキャン成功: ${decodedText}`);
    document.getElementById("result").innerText = `NFTページ: ${decodedText}`;

    // OpenSea Testnet (Amoy) のURLからコントラクトアドレスとトークンIDを取得
    const regex = /https:\/\/testnets\.opensea\.io\/ja\/assets\/amoy\/([^/]+)\/(\d+)/;
    const match = decodedText.match(regex);

    if (match) {
        const contractAddress = match[1];
        const tokenId = match[2];

        // カメラを自動でオフにする
        stopCamera();

        fetchNFTData(contractAddress, tokenId);
    } else {
        alert("このQRコードはTestnetのOpenSeaのNFTではありません。");
    }
}

// OpenSea Testnet (Amoy) API から NFT データを取得
async function fetchNFTData(contractAddress, tokenId) {
    const apiURL = `https://testnets-api.opensea.io/api/v2/chain/amoy/contract/${contractAddress}/nfts/${tokenId}`;

    try {
        const response = await fetch(apiURL);
        
        // レスポンスがエラーの場合、例外をスロー
        if (!response.ok) {
            throw new Error("APIレスポンスエラー");
        }

        const data = await response.json();
        console.log("取得したNFTデータ:", data);

        if (data.nft) {
            let nft = data.nft;
            let imageUrl = nft.display_image_url || nft.image_url || "";
            let name = nft.name || "不明なNFT";
            let description = nft.description || "説明なし";

            if (imageUrl) {
                document.getElementById("nft-image").src = imageUrl;
                document.getElementById("nft-image").style.display = "block";
            } else {
                document.getElementById("nft-image").style.display = "none";
                console.warn("画像URLが見つかりませんでした");
            }

            document.getElementById("nft-name").innerText = `名前: ${name}`;
            document.getElementById("nft-description").innerText = `説明: ${description}`;

            // エラー表示フラグをリセット
            errorShown = false;
        } else {
            handleFetchError();
        }
    } catch (error) {
        console.error("NFTデータの取得エラー:", error);
        handleFetchError();
    }
}

// エラー処理を一度だけ実行する関数
function handleFetchError() {
    if (!errorShown) {
        alert("NFT情報を取得できませんでした。");
        errorShown = true;
    }
}

// カメラを停止する関数
function stopCamera() {
    if (isCameraActive) {
        html5QrCode.stop().then(() => {
            console.log("カメラを停止しました");
            document.getElementById("toggle-camera").innerText = "📷 カメラをONにする";
            isCameraActive = false;
        }).catch(err => {
            console.error("カメラの停止に失敗:", err);
        });
    }
}

// カメラを再開する関数
function startCamera() {
    if (!isCameraActive) {
        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            onScanSuccess
        ).then(() => {
            console.log("カメラを再開しました");
            document.getElementById("toggle-camera").innerText = "📷 カメラをOFFにする";
            isCameraActive = true;
        }).catch(err => {
            console.error("カメラの再開に失敗:", err);
        });
    }
}

// カメラのON/OFFボタン
document.getElementById("toggle-camera").addEventListener("click", function() {
    if (isCameraActive) {
        stopCamera();
    } else {
        startCamera();
    }
});

// 初期化：カメラを起動
startCamera();
