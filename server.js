const Sequelize = require('sequelize');
const conn = new Sequelize('postgres://localhost/acme_country_club_db');

const express = require('express');
const app = express();

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
Member.hasMany(Member);
Member.hasMany(Booking);
Facility.hasMany(Booking);

app.get('/api/facilities', async (req, res, next) => {
	try {
		const facilities = await Facility.findAll({ include: [Booking] });
		res.send(facilities);
	} catch (error) {
		next(error);
	}
});

const init = async () => {
	try {
		await conn.sync({ force: true });
		console.log('starting');
		const [moe, lucy, ethyl, larry] = await Promise.all([
			Member.create({ name: 'moe' }),
			Member.create({ name: 'lucy' }),
			Member.create({ name: 'ethyl' }),
			Member.create({ name: 'larry' }),
		]);
		const [tennis, pingpong, marbles] = await Promise.all([
			Facility.create({ name: 'tennis' }),
			Facility.create({ name: 'pingpong' }),
			Facility.create({ name: 'marbles' }),
		]);
		moe.sponsorId = lucy.id;
		larry.sponsorId = lucy.id;
		ethyl.sponsorId = moe.id;
		await Promise.all([
			moe.save(),
			ethyl.save(),
			larry.save(),
			Booking.create({ bookerId: moe.id, facilityId: tennis.id }),
			Booking.create({ bookerId: lucy.id, facilityId: marbles.id }),
			Booking.create({ bookerId: lucy.id, facilityId: marbles.id }),
			Booking.create({ bookerId: larry.id, facilityId: pingpong.id }),
			Booking.create({ bookerId: ethyl.id, facilityId: pingpong.id }),
		]);
		const port = process.env.PORT || 3000;
		app.listen(port, () => {
			console.log(`Listening on port ${port}`);
		});
	} catch (ex) {
		console.log(ex);
	}
};
init();
