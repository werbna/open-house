
const express = require("express");
const router = express.Router();

const Listing = require("../models/listing");
const User = require("../models/user");

router.get("/", async (req, res, next) => {
  try {
    const populatedListings = await Listing.find({}).populate('owner');
    res.render('listing/index.ejs', {
      listings: populatedListings,
    });
  } catch (error) {
    next(error);
  }
})

router.get('/:listingId', async (req, res) => {
  try {
    const populatedListings = await Listing.findById(req.params.listingId).populate('owner');
    const userHasFavorited = populatedListings.favoritedByUsers.some((user) => user.equals(req.session.user._id)
    );
    res.render('listing/show.ejs', {
      listing: populatedListings,
      userHasFavorited: userHasFavorited,
    });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
})

router.get("/new", async (req, res) => {
  try {
    res.render("listing/new.ejs")
  } catch (error) {
    console.log(error)
  }
})


router.post("/", async (req, res) => {
  try {
    req.body.owner = req.session.user._id;
    await Listing.create(req.body)
    console.log(req.body) //This shows the owner is being passed.
    res.redirect("/listings")
  } catch (error) {
    console.log(error)
  }
})

router.delete('/:listingId', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (listing.owner.equals(req.session.user._id)) {
      await listing.deleteOne();
      res.redirect('/listings');
    } else {
      res.send("You don't have permission to do that.");
    }
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
})

router.get('/:listingId/edit', async (req,res) => {
  try {
    const currentListing = await Listing.findById(req.params.listingId);
    res.render('listing/edit.ejs', {
      listing: currentListing,
    });
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

router.put('/:listingId', async (req, res) => {
  try {
    const currentListing = await Listing.findById(req.params.listingId);
    if (currentListing.owner.equals(req.session.user._id)) {
      await currentListing.updateOne(req.body);
      res.redirect('/listings');
    } else {
      res.send("You don't have permission to do that.");
    }
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
})

router.post('/:listingId/favorited-by/:userId', async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.listingId, {
      $push: { favoritedByUsers: req.params.userId },
    });
    res.redirect(`/listings/${req.params.listingId}`);
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.delete('/:listingId/favorited-by/:userId', async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.listingId, {
      $pull: { favoritedByUsers: req.params.userId },
    });
    res.redirect(`/listings/${req.params.listingId}`);
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});



module.exports = router;
