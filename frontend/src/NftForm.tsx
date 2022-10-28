import React, { useState } from "react";
import {Button,FormControl,InputLabel,Input, FormHelperText } from "@mui/material"

// import { mintRecipeNFT } from "../actions/RecipeUploadActions";

export const NftForm = () => {

  const [photo, setPhotoData] = useState<any>();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  let handleSubmit = async (e) => {
    e.preventDefault();
   console.log(title,description,photo)
    const account = accounts[0];
    let success = await mintRecipeNFT(
      title,
      description,
      photo,
      account
    );
    // if (success) {
    //   alert("Minting is complete!");
    // } else {
    //   alert("Minting failed! You have already created your NFT for this week!");
    // }
  };
  return (
    <div className="RecipeUpload center">
      <h1>Upload your recipe here!</h1>
            <FormControl>
                <InputLabel >Title</InputLabel>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)}/>
                <FormControl/>
                <FormControl>

                <InputLabel >Description</InputLabel>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)}/>
                </FormControl>
                <FormControl>
                <Input
                    type="file"
                    onChange={(e) => setPhotoData(e.target.files[0])}
                    hidden
                />
                </FormControl>
            </FormControl>    
       
        <div>
          <Button onClick={handleSubmit}>
            Submit
          </Button>
        </div>
    </div>
  );
};
