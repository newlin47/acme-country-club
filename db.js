const Sequelize = require('sequelize');
const conn = new Sequelize('postgres://localhost/acme_country_club_db');

const Member = conn.define(
	'member',
	{
		id: {
			type: Sequelize.UUID,
			primaryKey: true,
			defaultValue: Sequelize.UUIDV4,
		},
		name: {
			type: Sequelize.STRING(50),
			allowNull: false,
			unique: true,
		},
	},
	{ timestamps: false }
);

const Facility = conn.define(
	'facility',
	{
		id: {
			type: Sequelize.UUID,
			primaryKey: true,
			defaultValue: Sequelize.UUIDV4,
		},
		name: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
	},
	{ timestamps: false }
);

const Booking = conn.define('booking', {
	id: {
		type: Sequelize.UUID,
		primaryKey: true,
		defaultValue: Sequelize.UUIDV4,
	},
});

Booking.belongsTo(Facility);
Booking.belongsTo(Member, { as: 'booker' });
Member.belongsTo(Member, { as: 'sponsor' });
Member.hasMany(Member, { as: 'sponsored', foreignKey: 'sponsorId' });
// prevents creating a memberId and instead uses the sponsorId
Member.hasMany(Booking);
Facility.hasMany(Booking);

module.exports = {
	conn,
	Member,
	Facility,
	Booking,
};
