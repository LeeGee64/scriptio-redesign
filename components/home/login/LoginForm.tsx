import Link from "next/link";
import Router from "next/router";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../src/context/UserContext";
import { login } from "../../../src/lib/requests";
import { VerificationStatus } from "../../../src/lib/utils";
import FormInfo, { FormInfoType } from "../FormInfo";

type Props = {
    verificationStatus: VerificationStatus;
};

const LoginForm = ({ verificationStatus }: Props) => {
    const { updateUser } = useContext(UserContext);
    const [formInfo, setFormInfo] = useState<FormInfoType | null>(null);

    useEffect(() => {
        switch (verificationStatus) {
            case VerificationStatus.FAILED:
                setFormInfo({
                    content: "An error occurred while verifying your account",
                    isError: true,
                });
                break;
            case VerificationStatus.SUCCESS:
                setFormInfo({
                    content: "Your account has been successfully verified",
                });
                break;
            case VerificationStatus.USED:
                setFormInfo({
                    content: "This email has already been registered",
                    isError: true,
                });
                break;
        }
    }, []);

    const resetFromInfo = () => {
        setFormInfo(null);
    };

    async function onSubmit(e: any) {
        e.preventDefault();
        resetFromInfo();

        const res = await login(e.target.email.value, e.target.password.value);
        const json = (await res.json()) as any;
        const resBody = json.body;

        if (res.status === 200) {
            updateUser(resBody);
            Router.push("/");
        } else {
            setFormInfo({ content: json.message, isError: true });
        }
    }

    return (
        <form className="home-form" onSubmit={onSubmit}>
            <div className="form-header">
                <h1>Log in</h1>
                <hr />
                {formInfo && <FormInfo info={formInfo} />}
            </div>

            <div className="form-element">
                <label id="email-form" className="form-element">
                    <span>Email</span>
                    <input
                        className="form-input"
                        name="email"
                        type="email"
                        onChange={resetFromInfo}
                        required
                    />
                </label>

                <label id="password-form" className="form-element">
                    <span>Password</span>
                    <input
                        className="form-input"
                        name="password"
                        type="password"
                        onChange={resetFromInfo}
                        required
                    />
                    <Link href="/recovery">Forgot password?</Link>
                </label>
            </div>

            <div id="form-btn-flex">
                <button className="form-btn" type="submit">
                    Log in
                </button>
            </div>
        </form>
    );
};

export default LoginForm;
