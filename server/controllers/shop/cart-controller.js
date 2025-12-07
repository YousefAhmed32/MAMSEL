const Cart = require('../../models/Cart')
const Product = require('../../models/Product');

const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity, selectedSize } = req.body;

        if (!userId || !productId || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid data provided!",
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // For clothes products, check if same product with same size exists
        // For other products, check if product exists regardless of size
        const findCurrentProductIndex = cart.items.findIndex((item) => {
            if (product.category === 'Clothes' && selectedSize) {
                return item.productId.toString() === productId && item.selectedSize === selectedSize;
            }
            return item.productId.toString() === productId;
        });

        if (findCurrentProductIndex === -1) {
            cart.items.push({ 
                productId, 
                quantity,
                selectedSize: selectedSize || null
            });
        } else {
            cart.items[findCurrentProductIndex].quantity += quantity;
        }

        await cart.save();


        await cart.populate({
            path: "items.productId",
            select: "image title price salePrice",
        });



        res.status(200).json({
            success: true,
            data: cart,


        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error",
        });
    }
};


const fetchCartItem = async (req, res) => {
    try {
        const { userId } = req.params;


        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User id is manadatory!"
            })
        }


        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'image title price salePrice',
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: { items: [] },
            });
        }

        const validItems = cart.items.filter(productItem => productItem.productId)

        if (validItems.length < cart.items.length) {
            cart.items = validItems
            await cart.save()
        }

        const populateCartItems = validItems.map(item => ({
            productId: item.productId._id,
            image: item.productId.image,
            title: item.productId.title,
            price: item.productId.price,
            salePrice: item.productId.salePrice,
            quantity: item.quantity,
            selectedSize: item.selectedSize || null,
        }))



        res.status(200).json({
            success: true,
            data: {
                ...cart._doc,
                items: populateCartItems
            },
        });


    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

const updateCartItemQty = async (req, res) => {
    try {
        const { userId, productId, quantity, selectedSize } = req.body;
        if (!userId || !productId || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data provided!',
            });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found!',
            });
        }

        // Get product info to determine if it's a clothes product
        const product = await Product.findById(productId);
        const isClothesProduct = product && product.category === 'Clothes';
        
        let findCurrentProductIndex = -1;
        
        if (selectedSize !== undefined && selectedSize !== null) {
            // If we're updating size, first check if there's already an item with the new size
            if (isClothesProduct) {
                const existingItemWithNewSize = cart.items.findIndex(item => 
                    item.productId.toString() === productId && item.selectedSize === selectedSize
                );
                
                if (existingItemWithNewSize !== -1) {
                    // Item with new size already exists, just update its quantity
                    cart.items[existingItemWithNewSize].quantity = quantity;
                    await cart.save();
                    
                    await cart.populate({
                        path: 'items.productId',
                        select: 'image title price salePrice',
                    });
                    
                    const populateCartItems = cart.items.map((item) => ({
                        productId: item.productId ? item.productId._id : null,
                        image: item.productId ? item.productId.image : null,
                        title: item.productId ? item.productId.title : "Product not found",
                        price: item.productId ? item.productId.price : null,
                        salePrice: item.productId ? item.productId.salePrice : null,
                        quantity: item.quantity,
                        selectedSize: item.selectedSize || null,
                    }));
                    
                    return res.status(200).json({
                        success: true,
                        data: {
                            ...cart._doc,
                            items: populateCartItems,
                        },
                    });
                }
            }
            
            // Find item by productId only (for size change - will update the first matching item)
            findCurrentProductIndex = cart.items.findIndex(item => 
                item.productId.toString() === productId
            );
        } else {
            // For quantity update: find by productId + selectedSize (if clothes) or productId only
            if (isClothesProduct) {
                // For clothes products, we need to match by productId + selectedSize
                // But since selectedSize is null/undefined here, we need to find the item
                // that matches the productId. If there are multiple sizes, we'll update the first one.
                // In practice, when updating quantity, the frontend should send the current selectedSize
                findCurrentProductIndex = cart.items.findIndex(item => 
                    item.productId.toString() === productId
                );
            } else {
                // For non-clothes products, find by productId only
                findCurrentProductIndex = cart.items.findIndex(item => 
                    item.productId.toString() === productId
                );
            }
        }

        if (findCurrentProductIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not present !',
            });
        }

        // Update quantity
        cart.items[findCurrentProductIndex].quantity = quantity;
        
        // Update size if provided
        if (selectedSize !== undefined && selectedSize !== null) {
            cart.items[findCurrentProductIndex].selectedSize = selectedSize;
        }

        await cart.save();

        await cart.populate({
            path: 'items.productId',
            select: 'image title price salePrice',
        });

        const populateCartItems = cart.items.map((item) => ({
            productId: item.productId ? item.productId._id : null,
            image: item.productId ? item.productId.image : null,
            title: item.productId ? item.productId.title : "Product not found",
            price: item.productId ? item.productId.price : null,
            salePrice: item.productId ? item.productId.salePrice : null,
            quantity: item.quantity,
            selectedSize: item.selectedSize || null,
        }));

        res.status(200).json({
            success: true,
            data: {
                ...cart._doc,
                items: populateCartItems,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error',
        });
    }
};


const deleteCartItem = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "Invalid data provided!",
            });
        }

        const cart = await Cart.findOne({ userId }).populate({
            path: "items.productId",
            select: "image title price salePrice",
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found!",
            });
        }

        cart.items = cart.items.filter(
            (item) => item.productId._id.toString() !== productId
        );

        await cart.save();

        await cart.populate({
            path: "items.productId",
            select: "image title price salePrice",
        });

        const populateCartItems = cart.items.map((item) => ({
            productId: item.productId ? item.productId._id : null,
            image: item.productId ? item.productId.image : null,
            title: item.productId ? item.productId.title : "Product not found",
            price: item.productId ? item.productId.price : null,
            salePrice: item.productId ? item.productId.salePrice : null,
            quantity: item.quantity,
            selectedSize: item.selectedSize || null,
        }));

        res.status(200).json({
            success: true,
            data: {
                ...cart._doc,
                items: populateCartItems,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error",
        });
    }
};

module.exports = {
    addToCart,
    fetchCartItem,
    updateCartItemQty,
    deleteCartItem,
};
