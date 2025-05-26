// middleware/auth.js 
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated() && req.user.is_active) {
    return next();
  }
  res.redirect('/login');
};

const requireAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.is_active && req.user.role === 'admin') {
    return next();
  }
  res.status(403).render('403', { 
    title: 'Access Denied',
    message: 'Admin access required'
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (req.isAuthenticated() && 
        req.user.is_active && 
        roles.includes(req.user.role)) {
      return next();
    }
    res.status(403).render('403', { 
      title: 'Access Denied',
      message: 'Insufficient permissions'
    });
  };
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireRole
};