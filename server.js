const { conn, Member, Facility, Booking } = require('./db');

const express = require('express');
const app = express();

app.get('/api/facilities', async (req, res, next) => {
	try {
		const facilities = await Facility.findAll({
			include: [{ model: Booking, include: { model: Member, as: 'booker' } }],
		});
		// shows the facilities, the bookings, and the members that booked them
		// a nested include
		res.send(facilities);
	} catch (error) {
		next(error);
	}
});

app.get('/api/bookings', async (req, res, next) => {
	try {
		const bookings = await Booking.findAll({
			include: { model: Member, as: 'booker' },
		});
		// shows the member that booked the booking using the 'booker' aliass
		res.send(bookings);
	} catch (error) {
		next(error);
	}
});

app.get('/api/members', async (req, res, next) => {
	try {
		const members = await Member.findAll({
			include: { model: Member, as: 'sponsor' },
			include: { model: Member, as: 'sponsored' },
		});
		// shows all members and their sponsors by referring to aliases
		res.send(members);
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
