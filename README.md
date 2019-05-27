# Recipes app backend
#### POST
* ##### Create user: */users*
* ##### Login user: */users/login*
* ##### Logout user: */users/logout*
* ##### Logout user (all): */users/logoutAll*
* ##### Upload user profile img: */users/me/profileImg*
* ##### Upload user banner img: */users/me/bannerImg*
* ##### Create recipe: */recipes*
* ##### Create recipe img: */recipes/:id/img*
#### GET
* ##### Get user: */users/me*
* ##### Get user profile img: */users/:id/profileImg*
* ##### Get user banner img: */users/:id/bannerImg*
* ##### Get recipe: */recipes/:id*
* ##### Get recipes (with filters): */recipes/?filters*
* ##### Get recipe image: */recipes/:id/img*
#### PATCH
* ##### Modify user: */users/me*
* ##### Modify recipe: */recipes/:id*
#### DELETE
* ##### Delete user: */users/me*
* ##### Delete user profile img: */users/me/profileImg*
* ##### Delete user banner img: */users/me/bannerImg*
* ##### Delete recipe: */recipes/:id*
* ##### Delete recipes (all): */recipes/deleteAll*
* ##### Delete recipe img: */recipes/:id/img*

## Models
#### Users
* ##### Username: *string - unique - required*
* ##### Email: *string - unique - required - valid email*
* ##### Password: *string - required - more than 7 chrs*
* ##### Bio: *string - not required*

#### Recipes
* ##### Title: *string - required*
* ##### Description: *string - required*
* ##### Favorite: *boolean - not required*
* ##### Steps: *array of string - required*
* ##### Ingredients: *array of strings - required*
* ##### Rating: *number - not required*
* ##### Difficulty: *number - (1, 5) - required*