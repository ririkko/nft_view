let html5QrCode = new Html5Qrcode("qr-reader");
let isCameraActive = true; // カメラの状態管理

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
        } else {
            alert("NFTデータが見つかりませんでした");
        }
    } catch (error) {
        console.error("NFTデータの取得エラー:", error);
        alert("NFT情報を取得できませんでした。");
    }
}

// カメラのON/OFF機能
document.getElementById("toggle-camera").addEventListener("click", function() {
    if (isCameraActive) {
        html5QrCode.stop().then(() => {
            console.log("カメラを停止しました");
            document.getElementById("toggle-camera").innerText = "📷 カメラをONにする";
            isCameraActive = false;
        }).catch(err => {
            console.error("カメラの停止に失敗:", err);
        });
    } else {
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
});

// 初期化：カメラを起動
html5QrCode.start(
    { facingMode: "environment" }, // スマホならリアカメラ、PCならWebカメラ
    { fps: 10, qrbox: 250 },
    onScanSuccess
).catch(err => {
    console.error("QRコードスキャンエラー: ", err);
});
