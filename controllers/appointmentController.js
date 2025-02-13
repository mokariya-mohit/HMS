const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const paypal = require('@paypal/checkout-server-sdk');

const client = new paypal.core.PayPalHttpClient(
    new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
);

// exports.bookAppointment = async (req, res) => {
//     try {
//         const { doctorId, appointmentType, appointmentDate, appointmentTime, patientIssue, diseaseName, paymentMethod } = req.body;

//         // Validate required fields
//         if (!doctorId || !appointmentType || !appointmentDate || !appointmentTime || !paymentMethod) {
//             return res.status(400).json({ message: 'Missing required fields' });
//         }

//         // Step 1: Fetch Doctor Details
//         const doctor = await Doctor.findById(doctorId);
//         if (!doctor) {
//             return res.status(404).json({ message: 'Doctor not found' });
//         }

//         // Step 2: Parse and Validate Appointment Date
//         const appointmentDateObj = new Date(appointmentDate);
//         if (isNaN(appointmentDateObj.getTime())) {
//             return res.status(400).json({ message: 'Invalid appointment date' });
//         }

//         // Step 3: Check Within Working Hours
//         const [workStart, workEnd] = doctor.workingTime.split(' - ').map(t => t.trim());
//         const [appointmentStart, appointmentEnd] = appointmentTime.split(' - ').map(t => t.trim());

//         // Function to parse time in "HH:MM AM/PM" format to Date object
//         const parseTimeToDate = (timeString, date) => {
//             const [time, modifier] = timeString.split(' ');
//             let [hours, minutes] = time.split(':').map(Number);
//             if (modifier === 'PM' && hours < 12) hours += 12; // Convert PM to 24-hour format
//             if (modifier === 'AM' && hours === 12) hours = 0; // Convert 12 AM to 0 hours
//             const timeDate = new Date(date); // Create a new date instance for today
//             timeDate.setHours(hours, minutes, 0, 0); // Set hours and minutes
//             return timeDate;
//         };

//         const appointmentStartTime = parseTimeToDate(appointmentStart, appointmentDateObj);
//         const appointmentEndTime = parseTimeToDate(appointmentEnd, appointmentDateObj);
//         const workingStartTime = parseTimeToDate(workStart, appointmentDateObj);
//         const workingEndTime = parseTimeToDate(workEnd, appointmentDateObj);

//         // Validate if appointment time is within working hours
//         if (!(appointmentStartTime >= workingStartTime && appointmentEndTime <= workingEndTime)) {
//             return res.status(400).json({ message: 'Appointment time is outside of working hours' });
//         }

//         // Step 4: Check Against Break Times
//         const breakTimes = doctor.breakTime ? doctor.breakTime.split(',').map(bt => bt.trim()) : [];
//         for (const breakPeriod of breakTimes) {
//             const [breakStart, breakEnd] = breakPeriod.split('-').map(t => t.trim());
//             const breakStartTime = parseTimeToDate(breakStart, appointmentDateObj);
//             const breakEndTime = parseTimeToDate(breakEnd, appointmentDateObj);
//             if (isOverlapping(appointmentStartTime, appointmentEndTime, breakStartTime, breakEndTime)) {
//                 return res.status(400).json({ message: 'Appointment time overlaps with break time' });
//             }
//         }

//         // Step 5: Check for Existing Appointments at the Same Time
//         const existingAppointment = await Appointment.findOne({
//             doctorId: doctorId,
//             appointmentDate: appointmentDateObj,
//             appointmentTime,
//             status: { $ne: 'Cancelled' }, // Exclude cancelled appointments
//         });

//         if (existingAppointment) {
//             return res.status(400).json({ message: 'Doctor is busy at the requested time' });
//         }

//         // Step 6: Create the New Appointment
//         const newAppointment = new Appointment({
//             patientId: req.patient._id,
//             doctorId,
//             appointmentType,
//             appointmentDate: appointmentDateObj,
//             appointmentTime, // Store as string, e.g., "10:00 AM"
//             patientIssue,
//             diseaseName,
//             paymentMethod,
//             paymentStatus: 'Pending', // Initial status
//         });

//         // Step 7: Handle PayPal Payment (if applicable)
//         if (paymentMethod === 'PayPal') {
//             const consultationRate = doctor.onlineConsultationRate; // Assuming you have this field
//             if (!consultationRate) {
//                 return res.status(400).json({ message: 'Consultation rate not set for the doctor' });
//             }

//             const request = new paypal.orders.OrdersCreateRequest();
//             request.requestBody({
//                 intent: 'CAPTURE',
//                 purchase_units: [{
//                     amount: {
//                         currency_code: 'USD',
//                         value: consultationRate.toFixed(2), // Use the doctor's consultation rate
//                     },
//                 }],
//             });

//             // Create PayPal order
//             const order = await client.execute(request);
//             const approvalLink = order.result.links.find(link => link.rel === 'approve').href;

//             // Store the payment order ID in the appointment
//             newAppointment.paymentOrderId = order.result.id;
//             await newAppointment.save();

//             // Update the doctor's scheduledAppointments with reference to the appointment ID
//             doctor.scheduledAppointments.push({
//                 appointmentId: newAppointment._id, // Store the appointment ID here
//                 appointmentDate: appointmentDateObj,
//                 appointmentTime,
//             });
//             await doctor.save();

//             // Return approval link for the user to complete the payment
//             return res.status(201).json({ message: 'Appointment booked successfully, please complete the payment.', approvalLink });
//         }

//         // Step 8: Save the Appointment (for non-PayPal payments)
//         await newAppointment.save();

//         // Update the doctor's scheduledAppointments with reference to the appointment ID
//         doctor.scheduledAppointments.push({
//             appointmentId: newAppointment._id, // Store the appointment ID here
//             appointmentDate: appointmentDateObj,
//             appointmentTime,
//         });
//         await doctor.save();

//         res.status(201).json({ message: 'Appointment booked successfully', newAppointment });
//     } catch (error) {
//         console.error('Error during appointment booking:', error);
//         res.status(500).json({ message: 'Error booking appointment', error: error.message });
//     }
// };

exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, appointmentType, appointmentDate, appointmentTime, patientIssue, diseaseName } = req.body;

        // Validate required fields
        if (!doctorId || !appointmentType || !appointmentDate || !appointmentTime) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Step 1: Fetch Doctor Details
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Step 2: Parse and Validate Appointment Date
        const appointmentDateObj = new Date(appointmentDate);
        if (isNaN(appointmentDateObj.getTime())) {
            return res.status(400).json({ message: 'Invalid appointment date' });
        }

        // Step 3: Check Within Working Hours
        const [workStart, workEnd] = doctor.workingTime.split(' - ').map(t => t.trim());
        const [appointmentStart, appointmentEnd] = appointmentTime.split(' - ').map(t => t.trim());

        // Function to parse time in "HH:MM AM/PM" format to Date object
        const parseTimeToDate = (timeString, date) => {
            const [time, modifier] = timeString.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12; // Convert PM to 24-hour format
            if (modifier === 'AM' && hours === 12) hours = 0; // Convert 12 AM to 0 hours
            const timeDate = new Date(date); // Create a new date instance for today
            timeDate.setHours(hours, minutes, 0, 0); // Set hours and minutes
            return timeDate;
        };

        const appointmentStartTime = parseTimeToDate(appointmentStart, appointmentDateObj);
        const appointmentEndTime = parseTimeToDate(appointmentEnd, appointmentDateObj);
        const workingStartTime = parseTimeToDate(workStart, appointmentDateObj);
        const workingEndTime = parseTimeToDate(workEnd, appointmentDateObj);

        // Validate if appointment time is within working hours
        if (!(appointmentStartTime >= workingStartTime && appointmentEndTime <= workingEndTime)) {
            return res.status(400).json({ message: 'Appointment time is outside of working hours' });
        }

        // Step 4: Check Against Break Times
        const breakTimes = doctor.breakTime ? doctor.breakTime.split(',').map(bt => bt.trim()) : [];
        for (const breakPeriod of breakTimes) {
            const [breakStart, breakEnd] = breakPeriod.split('-').map(t => t.trim());
            const breakStartTime = parseTimeToDate(breakStart, appointmentDateObj);
            const breakEndTime = parseTimeToDate(breakEnd, appointmentDateObj);
            if (isOverlapping(appointmentStartTime, appointmentEndTime, breakStartTime, breakEndTime)) {
                return res.status(400).json({ message: 'Appointment time overlaps with break time' });
            }
        }

        // Step 5: Check for Existing Appointments at the Same Time
        const existingAppointment = await Appointment.findOne({
            doctorId: doctorId,
            appointmentDate: appointmentDateObj,
            appointmentTime,
            status: { $ne: 'Cancelled' }, // Exclude cancelled appointments
        });

        if (existingAppointment) {
            return res.status(400).json({ message: 'Doctor is busy at the requested time' });
        }

        // Step 6: Create the New Appointment
        const newAppointment = new Appointment({
            patientId: req.patient._id,
            doctorId,
            appointmentType,
            appointmentDate: appointmentDateObj,
            appointmentTime, // Store as string, e.g., "10:00 AM"
            patientIssue,
            diseaseName,
            paymentStatus: 'Pending', // Initial status
        });

        // Step 7: Handle PayPal Payment (if applicable) - You can remove this part if not needed
        // if (paymentMethod === 'PayPal') {
        //     const consultationRate = doctor.onlineConsultationRate; // Assuming you have this field
        //     if (!consultationRate) {
        //         return res.status(400).json({ message: 'Consultation rate not set for the doctor' });
        //     }

        //     const request = new paypal.orders.OrdersCreateRequest();
        //     request.requestBody({
        //         intent: 'CAPTURE',
        //         purchase_units: [{
        //             amount: {
        //                 currency_code: 'USD',
        //                 value: consultationRate.toFixed(2), // Use the doctor's consultation rate
        //             },
        //         }],
        //     });

        //     // Create PayPal order
        //     const order = await client.execute(request);
        //     const approvalLink = order.result.links.find(link => link.rel === 'approve').href;

        //     // Store the payment order ID in the appointment
        //     newAppointment.paymentOrderId = order.result.id;
        //     await newAppointment.save();

        //     // Update the doctor's scheduledAppointments with reference to the appointment ID
        //     doctor.scheduledAppointments.push({
        //         appointmentId: newAppointment._id, // Store the appointment ID here
        //         appointmentDate: appointmentDateObj,
        //         appointmentTime,
        //     });
        //     await doctor.save();

        //     // Return approval link for the user to complete the payment
        //     return res.status(201).json({ message: 'Appointment booked successfully, please complete the payment.', approvalLink });
        // }

        // Step 8: Save the Appointment (for non-PayPal payments)
        await newAppointment.save();

        // Update the doctor's scheduledAppointments with reference to the appointment ID
        doctor.scheduledAppointments.push({
            appointmentId: newAppointment._id, // Store the appointment ID here
            appointmentDate: appointmentDateObj,
            appointmentTime,
        });
        await doctor.save();

        res.status(201).json({ message: 'Appointment booked successfully', newAppointment });
    } catch (error) {
        console.error('Error during appointment booking:', error);
        res.status(500).json({ message: 'Error booking appointment', error: error.message });
    }
};


const isOverlapping = (start1, end1, start2, end2) => {
    return (start1 < end2 && start2 < end1);
};


exports.getPaymentDetailsByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;
        const name = req.patient.firstName + ' ' + req.patient.lastName;

        const appointment = await Appointment.findOne({ paymentOrderId: orderId })
            .populate('doctorId', 'name specialty')
            .populate('patientId', 'name');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found with this payment order ID' });
        }

        const request = new paypal.orders.OrdersGetRequest(orderId);

        const orderResponse = await client.execute(request);

        if (orderResponse.statusCode !== 200) {
            return res.status(404).json({ message: 'Payment details not found for this order ID' });
        }

        const paymentStatus = orderResponse.result.status;
        const paymentAmount = orderResponse.result.purchase_units[0].amount.value;
        const paymentCurrency = orderResponse.result.purchase_units[0].amount.currency_code;

        const paymentDetails = {
            patientName: name,
            doctorName: appointment.doctorId.name,
            specialty: appointment.doctorId.specialty,
            appointmentType: appointment.appointmentType,
            appointmentDate: appointment.appointmentDate,
            appointmentTime: appointment.appointmentTime,
            patientIssue: appointment.patientIssue,
            diseaseName: appointment.diseaseName,
            paymentMethod: appointment.paymentMethod,
            paymentStatus: paymentStatus,
            paymentAmount: `${paymentAmount} ${paymentCurrency}`,
        };

        res.status(200).json(paymentDetails);
    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({ message: 'Error fetching payment details', error });
    }
};

exports.getPatientAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.patient._id }).populate('doctorId', 'name specialty');
        res.status(200).json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching appointments', error });
    }
};

exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate('doctorId', 'name specialty');
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.status(200).json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching appointment details', error });
    }
};
exports.updateAppointment = async (req, res) => {
    try {
        const { appointmentDate, appointmentTime } = req.body;
        const { id } = req.params;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const doctorId = appointment.doctorId;
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(id, req.body, { new: true });

        doctor.scheduledAppointments = doctor.scheduledAppointments.filter(
            (scheduledAppointment) => scheduledAppointment.appointmentId.toString() !== id
        );

        doctor.scheduledAppointments.push({
            appointmentId: id,
            appointmentDate: appointmentDate,
            appointmentTime: appointmentTime,
        });

        await doctor.save();

        res.status(200).json({ message: 'Appointment updated successfully', updatedAppointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating appointment', error });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointmentToDelete = await Appointment.findById(id);
        if (!appointmentToDelete) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const doctorId = appointmentToDelete.doctorId;
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const deletedAppointment = await Appointment.findByIdAndDelete(id);
        if (!deletedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        doctor.scheduledAppointments = doctor.scheduledAppointments.filter(
            (scheduledAppointment) =>
                !(scheduledAppointment.appointmentDate === appointmentToDelete.appointmentDate.toISOString().split('T')[0] && // Compare date
                    scheduledAppointment.appointmentTime === appointmentToDelete.appointmentTime)
        );
        await doctor.save();

        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting appointment', error });
    }
};
