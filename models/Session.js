'use strict';

module.exports = (sequelize, DataTypes) => {
const Session = sequelize.define('Session', {
  sid: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    comment: 'Session ID'
  },
  expires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Session expiration time'
  },
  data: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Serialized session data'
  }
}, {
  tableName: 'Sessions',
  timestamps: true,
  indexes: [
    {
      fields: ['expires']
    }
  ]
});

// Clean up expired sessions (optional method)
Session.cleanupExpired = async function() {
  const now = new Date();
  const deleted = await this.destroy({
    where: {
      expires: {
        [sequelize.Sequelize.Op.lt]: now
      }
    }
  });
  console.log(`Cleaned up ${deleted} expired sessions`);
  return deleted;
};

return Session;
};