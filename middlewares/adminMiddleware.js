// adminMiddleware.js
export const isAdmin = (req, res, next) => {
    const { role } = req.user; // Assuming req.user is populated after decoding the JWT
    
    if (role !== 'Admin') {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    
    next();
  };
  