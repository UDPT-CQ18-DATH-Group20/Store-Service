const { google } = require("googleapis");

const CLIENT_ID =
  "619771572873-v3un2ig4mvsf43dosbeaf124pbbrc5km.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN =
  "1//04eoURefaO-mLCgYIARAAGAQSNwF-L9IrVpA6kT83yNg-Tnpzav-lSg8vr4V8-uo9Oc6Cj8i1zQdkXOKvf_osoaSGUWd1lds4Pns";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

exports.uploadFile = async function (
  fileName,
  folderName,
  mimeType,
  fileStream
) {
  var folder;
  if (folderName) {
    folder = await searchFoler(folderName);
    if (!folder) {
      folder = await createFolder(folderName);
    }
  }

  var file = await createFile(
    fileName,
    folder ? folder.id : null,
    fileStream,
    mimeType
  );
  return await generatePublicUrl(file.id);
};

async function generatePublicUrl(fileId) {
  try {
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    var res = await drive.files.get({
      fileId: fileId,
      fields: "webContentLink",
    });

    return res.data.webContentLink;
  } catch (e) {
    throw e;
  }
}

async function createFile(fileName, folderId, fileStream, mimeType) {
  try {
    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: mimeType,
        parents: folderId ? [folderId] : [],
        fields: "files(id, name)",
        spaces: "drive",
      },
      media: {
        body: fileStream,
        mimeType: mimeType,
      },
    });

    return res.data;
  } catch (e) {
    throw e;
  }
}

async function searchFoler(folderName) {
  try {
    var res = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
      fields: "files(id, name)",
      spaces: "drive",
    });

    return res.data.files ? res.data.files[0] : null;
  } catch (e) {
    throw e;
  }
}

async function createFolder(folderName) {
  return await drive.files.create({
    resource: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      spaces: "drive",
    },
    fields: "id, name",
  });
}
