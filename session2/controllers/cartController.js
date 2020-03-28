const HttpStatusCode = require("http-status-codes");
const {
  mongo: { ObjectId }
} = require("mongoose");

const findPrice = async req => {
  const products = await req.db.Product.find({
    _id: req.body.products.map(id => ObjectId(id))
  });
  let price = 0;
  for (const product of products) {
    price += product.price;
  }
  return price;
};

const createCart = async (req, res) => {
  try {
    let value = await findPrice(req);
    /**Am schimbat price in value ca nu imi adauga in baza de date price */
    const cart = await req.db.Cart.create({ ...req.body, value });

    return res.status(HttpStatusCode.CREATED).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error(error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something bad happened!"
    });
  }
};

const getCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await req.db.Cart.findOne({
      _id: ObjectId(cartId)
    });
    /** Aici a uitat cineva sa verifice daca exista, altfel da eroare cand incerci sa accesezi products of null */
    if (!cart) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Cart not found!"
      });
    }
    const products = await req.db.Product.find({
      _id: cart.products.map(id => ObjectId(id))
    });

    cart.products = products;

    const user = await req.db.User.findOne(
      {
        _id: ObjectId(cart.userId)
      },
      {
        password: 0
      }
    );

    return res.status(HttpStatusCode.OK).json({
      success: true,
      cart: {
        ...cart.toObject(),
        user
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something bad happened!"
    });
  }
};

const getCarts = async (req, res) => {
  try {
    let carts = await req.db.Cart.find({});
    let i = 0;
    for (let cart of carts) {
      const products = await req.db.Product.find({
        _id: cart.products.map(id => ObjectId(id))
      });
      cart.products = products;

      const user = await req.db.User.findOne(
        {
          _id: ObjectId(cart.userId)
        },
        {
          password: 0
        }
      );
      carts[i] = {
        ...cart.toObject(),
        user
      };
      i++;
    }
    return res.status(HttpStatusCode.OK).json({
      success: true,
      carts
    });
  } catch (error) {
    console.error(error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something bad happened!"
    });
  }
};

const updateCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await req.db.Cart.findOne({
      _id: ObjectId(cartId)
    });

    if (!cart) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Cart not found!"
      });
    }
    let value = await findPrice(req);

    await req.db.Cart.updateOne(
      {
        _id: ObjectId(cartId)
      },
      { ...req.body, value }
    );

    const updatedCart = await req.db.Cart.findOne({
      _id: ObjectId(cartId)
    });

    return res.status(HttpStatusCode.OK).json({
      success: true,
      cart: updatedCart
    });
  } catch (error) {
    console.error(error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something bad happened!"
    });
  }
};

const deleteCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await req.db.Cart.findOne({
      _id: ObjectId(cartId)
    });

    if (!cart) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Cart not found!"
      });
    }

    await req.db.Cart.deleteOne({
      _id: ObjectId(cartId)
    });

    return res.status(HttpStatusCode.NO_CONTENT).json({
      success: true
    });
  } catch (error) {
    console.error(error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something bad happened!"
    });
  }
};

module.exports = {
  createCart,
  getCart,
  getCarts,
  updateCart,
  deleteCart
};
