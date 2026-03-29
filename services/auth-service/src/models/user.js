const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },

        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        refreshToken: {
            type: String,
            default: null,
        },
    },
        { timestamps: true }
);

//Hasing password before saving
userSchema.pre('save', async function () {
    console.log('\n🟡 [PRE-SAVE HOOK]');
    console.log('User email:', this.email);

    if (!this.isModified('password')) {
        console.log('⏭️ Skipping hashing');
        return;
    }

    console.log('🔐 Hashing password...');
    this.password = await bcrypt.hash(this.password, 10);

    console.log('✅ Hash complete');
});

//Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
