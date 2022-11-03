/* eslint-disable indent */
/* eslint-disable no-unused-vars */
import { React, useState } from 'react';
import { BiCamera } from 'react-icons/bi';
import PhotoRecipeCropper from './PhotoRecipeCropper';
import { useNavigate } from 'react-router-dom';

import '../styles/PhotoRecipe.css';
import '../styles/ImageInput.css';
import 'react-image-crop/dist/ReactCrop.css';

const AWS = require('aws-sdk');

/*
Reseptin skannaaminen/lisääminen kuvasta.
*/
const RecipePhoto = () => {
  const navigate = useNavigate();

  /*
  Skannausprosessin vaiheen tila:
  0 = Kuvan valinta / ottaminen
  1 = Nimen rajaus
  2 = Ainesten rajaus
  3 = Vaihdeiden rajaus
  */
  const [stage, setStage] = useState(0);

  // Rajaamattomann kuvan tila:
  const [image, setImage] = useState({
    image: null,
    source: null,
  });

  // Rajattujen kuvien tilat:
  const [croppedImage1, setCroppedImage1] = useState();
  const [croppedImage2, setCroppedImage2] = useState();
  const [croppedImage3, setCroppedImage3] = useState();

  // Rekognitionin käyttöönottoon liittyvät asetukset:
  const config = new AWS.Config({});
  AWS.config.update({ region: 'eu-west-1' });
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  });
  // eslint-disable-next-line new-cap
  const client = new AWS.Rekognition();

  // Muuttaa rajatut kuvat Rekognitionin vaatimaan muotoon:
  const convertImage = (encodedFile) => {
    const base64Image = encodedFile.split('data:image/jpeg;base64,')[1];
    const binaryImg = atob(base64Image);
    const length = binaryImg.length;
    const ab = new ArrayBuffer(length);
    const ua = new Uint8Array(ab);
    for (let i = 0; i < length; i++) {
      ua[i] = binaryImg.charCodeAt(i);
    }
    const blob = new Blob([ab], {
      type: 'image/jpeg',
    });
    return ab;
  };

  // Muuttaa kuvan oikeaan muotoon (convertImage), lähettää sen Rekoon (client).
  const imageToText = (image) => {
    return new Promise((resolve, reject) => {
      const imageBlob = image.image;
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        const imageInCorrectFormat = convertImage(reader.result);
        const params = {
          Image: {
            Bytes: imageInCorrectFormat,
          },
        };
        client.detectText(params, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.TextDetections);
          }
        });
      });

      reader.readAsDataURL(imageBlob);
    });
  };

  const multilineResultsToOneString = (results) => {
    let finishedText = '';
    results.forEach((line) => {
      if (line.Type === 'LINE') {
        finishedText += `${line.DetectedText} \n`;
      }
    });
    return finishedText;
  };

  const finishScanning = async () => {
    const nameResults = await imageToText(croppedImage1);
    const ingredietsResults = await imageToText(croppedImage2);
    const directionsResults = await imageToText(croppedImage3);

    const recipeName = nameResults[0].DetectedText;

    const recipeIngredients = multilineResultsToOneString(ingredietsResults);
    const recipeDirections = multilineResultsToOneString(directionsResults);

    console.log(recipeIngredients);

    const dietsObject = {
      kasvis: 0,
      maidoton: 0,
      vegaaninen: 0,
      gluteeniton: 0,
      laktoositon: 0,
      kananmunaton: 0,
    };

    const categoriesObj = {
      juomat: 0,
      keitot: 0,
      salaatit: 0,
      alkuruoat: 0,
      lisukkeet: 0,
      pääruoat: 0,
      välipalat: 0,
      jälkiruoat: 0,
      makeat_leivonnaiset: 0,
      suolaiset_leivonnaiset: 0,
    };

    const recipeData = {
      nimi: recipeName,
      annosten_maara: null,
      erikoisruokavaliot: JSON.stringify(dietsObject),
      julkinen: 0,
      kategoriat: JSON.stringify(categoriesObj),
      kuva: null,
      ohjeet: recipeDirections,
      uusi: 1,
      valmistusaika: null,
    };

    const ingredientsData = null;

    navigate('/muokkaa', {
      state: {
        recipeData: recipeData,
        ingredientsData: ingredientsData,
        editMode: true,
      },
    });
  };

  if (croppedImage1 && croppedImage2 && croppedImage3) {
    finishScanning();
  }

  // Funktio, jolla kuva lisätään omaan tilaansa:
  const uploadImage = (e) => {
    if (e.target.files.length === 0) return;
    setImage({
      image: e.target.files[0],
      source: URL.createObjectURL(e.target.files[0]),
    });
    setStage(1);
  };

  return (
    <div className="photoRecipeContainer">
      {stage === 0 && (
        <div>
          <div>
            <div className="imageInputContainer">
              <h1>Kuvaa resepti</h1>

              <label className="imageInputLabel photoRecipeInput">
                Ota kuva tai valitse galleriasta
                <input
                  type="file"
                  className="imageInput"
                  name="image"
                  onChange={uploadImage}
                  accept="image/*"
                />
                <span className="imageInputStatusInfo">
                  <div className="noPreview">
                    <BiCamera className="cameraIcon" />
                  </div>
                </span>
              </label>
            </div>

            <div className="photoRecipeInstructions">
              <p>
                Voit skannata reseptin kuvasta. Mitä selkeämpi kuva on, sitä
                paremmin sovellus osaa kopioida tekstin.
              </p>

              <p>Kuvassa tulee näkyä reseptin nimi, ainekset ja ohjeet.</p>
            </div>
          </div>
        </div>
      )}

      {stage === 1 && (
        <div>
          <h2>Rajaa reseptin nimi</h2>

          <PhotoRecipeCropper
            image={image}
            setCroppedImage={setCroppedImage1}
            setStage={setStage}
            stage={stage}
          />
        </div>
      )}

      {stage === 2 && (
        <div>
          <h2>Rajaa reseptin ainekset</h2>

          <PhotoRecipeCropper
            image={image}
            setCroppedImage={setCroppedImage2}
            setStage={setStage}
            stage={stage}
          />
        </div>
      )}

      {stage === 3 && (
        <div>
          <h2>Rajaa reseptin ohjeet</h2>

          <PhotoRecipeCropper
            image={image}
            setCroppedImage={setCroppedImage3}
            setStage={setStage}
            stage={stage}
          />
        </div>
      )}

      {stage === 4 && <p>Ladataan...</p>}
    </div>
  );
};

export default RecipePhoto;
